import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// CONFIGURAÇÕES
// ===============================

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const paymentClient = new Payment(mp);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // ✅ corrigido (padrão do projeto)
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ===============================
// PLANOS (FONTE REAL ATUALIZADA)
// 🔥 PREÇOS NOVOS DEFINIDOS POR VOCÊ
// ===============================

const PLANOS: Record<string, Record<string, number>> = {
  basico: {
    mensal: 149.9,
    trimestral: 149.9 * 3 * 0.95,
    anual: 149.9 * 12 * 0.8,
  },
  profissional: {
    mensal: 247.9,
    trimestral: 247.9 * 3 * 0.95,
    anual: 247.9 * 12 * 0.8,
  },
  ultra: {
    mensal: 452.9,
    trimestral: 452.9 * 3 * 0.95,
    anual: 452.9 * 12 * 0.8,
  },
  empresarial: {
    mensal: 627.9,
    trimestral: 627.9 * 3 * 0.95,
    anual: 627.9 * 12 * 0.8,
  },
  premium: {
    mensal: 789.9,
    trimestral: 789.9 * 3 * 0.95,
    anual: 789.9 * 12 * 0.8,
  },
};

// ===============================
// HELPERS
// ===============================

function parseExternalReference(ref: string | null) {
  if (!ref) return null;

  const [user_id, plano, periodo] = ref.split("|");

  if (!user_id || !plano || !periodo) return null;

  return { user_id, plano, periodo };
}

function isValidValue(plano: string, periodo: string, valor: number) {
  const esperado = PLANOS[plano]?.[periodo];
  if (!esperado) return false;

  const tolerancia = 0.1; // 🔥 aumentei levemente (produção real)
  return Math.abs(valor - esperado) < tolerancia;
}

function calcularRenovacao(periodo: string) {
  const renovacao = new Date();

  if (periodo === "mensal") renovacao.setMonth(renovacao.getMonth() + 1);
  if (periodo === "trimestral") renovacao.setMonth(renovacao.getMonth() + 3);
  if (periodo === "anual") renovacao.setFullYear(renovacao.getFullYear() + 1);

  return renovacao.toISOString();
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
    // CONSULTA PAGAMENTO MP
    // ===========================

    const payment = await paymentClient.get({ id: paymentId });

    if (!payment) {
      return NextResponse.json(
        { ok: false, error: "payment_not_found" },
        { status: 404 }
      );
    }

    const status = payment.status;
    const externalRef = payment.external_reference;
    const valorPago = Number(payment.transaction_amount);
    const moeda = payment.currency_id ?? "BRL";

    const parsed = parseExternalReference(externalRef);

    if (!parsed) {
      return NextResponse.json(
        { ok: false, error: "invalid_external_reference" },
        { status: 400 }
      );
    }

    const { user_id, plano, periodo } = parsed;

    // ===========================
    // VALIDAÇÃO CRUZADA
    // ===========================

    if (!PLANOS[plano]?.[periodo]) {
      return NextResponse.json(
        { ok: false, error: "invalid_plan_or_period" },
        { status: 400 }
      );
    }

    if (!isValidValue(plano, periodo, valorPago)) {
      return NextResponse.json(
        {
          ok: false,
          error: "valor_mismatch",
          esperado: PLANOS[plano][periodo],
          recebido: valorPago,
        },
        { status: 400 }
      );
    }

    if (moeda !== "BRL") {
      return NextResponse.json(
        { ok: false, error: "currency_mismatch", moeda },
        { status: 400 }
      );
    }

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
      plano,
      periodo,
      valor: valorPago,
      moeda,
      origem: "mercadopago",
      evento: status,
      payment_id: paymentId,
      external_reference: externalRef,
      criado_em: new Date().toISOString(),
    });

    // ===========================
    // ATIVAÇÃO ASSINATURA
    // ===========================

    if (status === "approved") {
      const renovacao_em = calcularRenovacao(periodo);

      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("id")
        .eq("user_id", user_id)
        .maybeSingle();

      if (assinatura) {
        await supabase
          .from("assinaturas")
          .update({
            status: "ativa",
            plano,
            periodo,
            valor: valorPago,
            metodo_pagamento: "mercadopago",
            renovacao_em,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assinatura.id);
      } else {
        await supabase.from("assinaturas").insert({
          user_id,
          plano,
          periodo,
          status: "ativa",
          valor: valorPago,
          metodo_pagamento: "mercadopago",
          renovacao_em,
          criado_em: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
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
// HEALTH CHECK
// ===============================

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "mercadopago_webhook",
    status: "alive",
  });
}