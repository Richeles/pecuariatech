// app/api/checkout/webhook/route.ts
// Webhook Mercado Pago — Produção
// Equação Y preservada | Server-only

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

// ================================
// CONFIG MERCADO PAGO (SERVER)
// ================================
const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// ================================
// SUPABASE — SERVICE ROLE (SERVER)
// ================================
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ================================
// POST — WEBHOOK
// ================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /**
     * Mercado Pago envia:
     * {
     *   action: "payment.created" | "payment.updated",
     *   data: { id: "123456789" }
     * }
     */
    const paymentId = body?.data?.id;

    if (!paymentId) {
      return NextResponse.json(
        { erro: "Evento inválido" },
        { status: 400 }
      );
    }

    // ================================
    // BUSCAR PAGAMENTO REAL NO MP
    // ================================
    const payment = new Payment(mp);
    const mpPayment = await payment.get({ id: paymentId });

    const status = mpPayment.status; // approved | pending | rejected
    const externalRef = mpPayment.external_reference;

    /**
     * external_reference DEVE conter:
     * user_id|plano_id|periodo
     * (definido na criação da preference)
     */
    if (!externalRef) {
      return NextResponse.json(
        { erro: "external_reference ausente" },
        { status: 400 }
      );
    }

    const [user_id, plano_id, periodo] = externalRef.split("|");

    if (!user_id || !plano_id) {
      return NextResponse.json(
        { erro: "Referência inválida" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // ================================
    // REGISTRAR EVENTO DE PAGAMENTO
    // ================================
    await supabase.from("pagamentos").upsert({
      gateway: "mercado_pago",
      gateway_payment_id: String(paymentId),
      user_id,
      plano_id,
      periodo,
      status,
      valor: mpPayment.transaction_amount,
      atualizado_em: new Date().toISOString(),
    });

    // ================================
    // ATIVAR ASSINATURA SE APROVADO
    // ================================
    if (status === "approved") {
      await supabase.from("assinaturas").upsert({
        user_id,
        plano_id,
        status: "ativo",
        inicio_em: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook erro:", err);
    return NextResponse.json(
      { erro: "Falha no webhook" },
      { status: 500 }
    );
  }
}
