// CAMINHO: app/api/checkout/webhook/route.ts
// Next.js 16 + TypeScript strict
// Webhook Mercado Pago — Ativação de Assinatura + Auditoria Financeira
// Equação Y + Triângulo 360

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

// ================================
// VALIDAR VARIÁVEIS
// ================================
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("SUPABASE_URL não configurado");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");
}

// ================================
// MERCADO PAGO (SERVER)
// ================================
const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// ================================
// WEBHOOK
// ================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Compatibilidade Mercado Pago
    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split("/")?.pop();

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    // Buscar pagamento real
    const payment = new Payment(mp);
    const paymentInfo = await payment.get({ id: paymentId });

    if (paymentInfo.status !== "approved") {
      return NextResponse.json({
        ignored: true,
        status: paymentInfo.status,
      });
    }

    const externalReference = paymentInfo.external_reference;
    if (!externalReference) {
      throw new Error("external_reference ausente");
    }

    // user_id|plano|periodo
    const [user_id, plano, periodo] =
      externalReference.split("|");

    if (!user_id || !plano || !periodo) {
      throw new Error("external_reference inválida");
    }

    // ================================
    // SUPABASE (RUNTIME ONLY)
    // ================================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ================================
    // CÁLCULO DE PERÍODO (SAFE)
    // ================================
    const inicio = new Date();
    const fim = new Date(inicio);

    if (periodo === "mensal") fim.setMonth(fim.getMonth() + 1);
    if (periodo === "trimestral") fim.setMonth(fim.getMonth() + 3);
    if (periodo === "anual") fim.setFullYear(fim.getFullYear() + 1);

    // ================================
    // ATIVAR ASSINATURA PAGA
    // ================================
    const { error: assinaturaError } = await supabase
      .from("assinaturas")
      .insert({
        user_id,
        plano,
        periodo,
        status: "ativo",
        origem: "mercadopago",
        inicio,
        fim,
        external_reference: externalReference,
        payment_id: paymentId,
        valor: paymentInfo.transaction_amount,
      });

    if (assinaturaError) throw assinaturaError;

    // ================================
    // AUDITORIA FINANCEIRA (LOG IMUTÁVEL)
    // ================================
    await supabase.from("financeiro_logs").insert({
      user_id,
      plano,
      periodo,
      valor: paymentInfo.transaction_amount,
      moeda: paymentInfo.currency_id ?? "BRL",
      origem: "mercadopago",
      evento: "pagamento_aprovado",
      payment_id: paymentId,
      external_reference: externalReference,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook Mercado Pago ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Erro no webhook" },
      { status: 500 }
    );
  }
}
