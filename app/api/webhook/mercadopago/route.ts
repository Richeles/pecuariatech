import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// CONFIGS
// ===============================

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const paymentClient = new Payment(mp);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // webhook exige service role
);

// ===============================
// HELPERS
// ===============================

function parseExternalReference(ref: string | null) {
  if (!ref) return null;

  const [user_id, plano, periodo] = ref.split("|");

  if (!user_id || !plano || !periodo) return null;

  return { user_id, plano, periodo };
}

// ===============================
// POST — WEBHOOK
// ===============================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const paymentId = body?.data?.id;
    const eventType = body?.type;

    if (!paymentId || eventType !== "payment") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // ===========================
    // CONSULTA PAGAMENTO NO MP
    // ===========================

    const payment = await paymentClient.get({ id: paymentId });

    if (!payment) {
      return NextResponse.json({ ok: false, error: "payment_not_found" }, { status: 404 });
    }

    const status = payment.status; // approved, rejected, etc
    const externalRef = payment.external_reference;

    const parsed = parseExternalReference(externalRef);

    if (!parsed) {
      return NextResponse.json({ ok: false, error: "invalid_external_reference" }, { status: 400 });
    }

    const { user_id, plano, periodo } = parsed;

    // ===========================
    // IDEMPOTÊNCIA
    // ===========================

    const { data: existingLog } = await supabase
      .from("financeiro_logs")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (existingLog) {
      return NextResponse.json({ ok: true, idempotent: true });
    }

    // ===========================
    // LOG FINANCEIRO
    // ===========================

    await supabase.from("financeiro_logs").insert({
      user_id,
      payment_id: paymentId,
      status,
      plano,
      periodo,
      valor: payment.transaction_amount,
      raw_payload: payment,
    });

    // ===========================
    // ATIVAÇÃO ASSINATURA
    // ===========================

    if (status === "approved") {
      await supabase
        .from("assinaturas")
        .update({
          status: "ativa",
          plano,
          periodo,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id);
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { ok: false, error: "webhook_failure" },
      { status: 500 }
    );
  }
}

// ===============================
// GET — HEALTH CHECK
// ===============================

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "mercadopago_webhook",
    status: "alive",
  });
}
