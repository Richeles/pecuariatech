// app/api/webhooks/mercadopago/route.ts
// Next.js 16 + TypeScript strict
// WEBHOOK DEFINITIVO — GOVERNANÇA FINANCEIRA

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

// ==============================
// MERCADO PAGO (SERVER ONLY)
// ==============================
const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// ==============================
// SUPABASE SERVICE ROLE (SERVER)
// ==============================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ==============================
// POST — WEBHOOK
// ==============================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mercado Pago envia vários eventos inúteis → filtramos
    if (!body?.type || !body?.data?.id) {
      return NextResponse.json({ ok: true });
    }

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    // ==============================
    // BUSCAR PAGAMENTO REAL
    // ==============================
    const payment = await new Payment(mp).get({
      id: body.data.id,
    });

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // ==============================
    // DADOS GOVERNANTES (EQUAÇÃO Y)
    // ==============================
    const externalRef = payment.external_reference;
    if (!externalRef) {
      throw new Error("Pagamento sem external_reference");
    }

    /**
     * external_reference esperado:
     * userId|plano|periodo
     */
    const [userId, plano, periodo] = externalRef.split("|");

    if (!userId || !plano || !periodo) {
      throw new Error("external_reference inválido");
    }

    // ==============================
    // IDEMPOTÊNCIA (ANTI DUPLICAÇÃO)
    // ==============================
    const { data: jaProcessado } = await supabase
      .from("financeiro_logs")
      .select("id")
      .eq("mercadopago_payment_id", payment.id)
      .single();

    if (jaProcessado) {
      return NextResponse.json({ ok: true });
    }

    // ==============================
    // LOG FINANCEIRO IMUTÁVEL
    // ==============================
    await supabase.from("financeiro_logs").insert({
      user_id: userId,
      plano,
      periodo,
      valor: payment.transaction_amount,
      status: "aprovado",
      mercadopago_payment_id: payment.id,
      raw: payment,
    });

    // ==============================
    // ATIVAR / ATUALIZAR ASSINATURA
    // ==============================
    await supabase.from("assinaturas").upsert({
      user_id: userId,
      plano,
      periodo,
      status: "ativa",
      origem: "mercadopago",
      atualizado_em: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("WEBHOOK MP ERRO:", err);
    return NextResponse.json({ erro: "Webhook falhou" }, { status: 500 });
  }
}
