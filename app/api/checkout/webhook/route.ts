// app/api/checkout/webhook/route.ts
// Next.js 16 + TypeScript strict
// Webhook Mercado Pago — Produção
// Fonte Y preservada | Ativação real de assinatura

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
// CLIENTS (SERVER ONLY)
// ================================
const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================================
// WEBHOOK
// ================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /**
     * Mercado Pago envia formatos diferentes.
     * Garantimos compatibilidade:
     */
    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split("/")?.pop();

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId não encontrado" },
        { status: 400 }
      );
    }

    // ================================
    // BUSCAR PAGAMENTO REAL
    // ================================
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

    /**
     * Equação Y:
     * user_id|plano|periodo
     */
    const [user_id, plano, periodo] =
      externalReference.split("|");

    if (!user_id || !plano || !periodo) {
      throw new Error("external_reference inválida");
    }

    // ================================
    // ENCERRAR TRIAL (SE EXISTIR)
    // ================================
    await supabase
      .from("assinaturas")
      .update({ status: "expirado" })
      .eq("user_id", user_id)
      .eq("status", "trial");

    // ================================
    // CALCULAR PERÍODO
    // ================================
    const inicio = new Date();

    let dias = 30;
    if (periodo === "trimestral") dias = 90;
    if (periodo === "anual") dias = 365;

    const fim = new Date(
      inicio.getTime() + dias * 24 * 60 * 60 * 1000
    );

    // ================================
    // ATIVAR ASSINATURA PAGA
    // ================================
    const { error } = await supabase
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
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook Mercado Pago ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Erro no webhook" },
      { status: 500 }
    );
  }
}
