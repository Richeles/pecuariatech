// app/api/webhooks/mercadopago/route.ts
// Next.js 16 + TypeScript strict
// WEBHOOK DEFINITIVO — GOVERNANÇA FINANCEIRA (CANÔNICO)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ==============================
// SUPABASE SERVICE ROLE (SERVER)
// ==============================
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ==============================
// POST — WEBHOOK
// ==============================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mercado Pago envia vários eventos — filtramos
    if (body?.type !== "payment" || !body?.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data.id;

    // ==============================
    // BUSCAR PAGAMENTO REAL (API REST)
    // ==============================
    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!paymentRes.ok) {
      throw new Error("Falha ao consultar pagamento no Mercado Pago");
    }

    const payment = await paymentRes.json();

    // ==============================
    // VALIDAR STATUS
    // ==============================
    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // ==============================
    // DADOS GOVERNANTES (EQUAÇÃO Y)
    // ==============================
    const externalRef: string | null = payment.external_reference;

    if (!externalRef) {
      throw new Error("Pagamento aprovado sem external_reference");
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
      .eq("mercadopago_payment_id", paymentId)
      .maybeSingle();

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
      mercadopago_payment_id: paymentId,
      raw: payment,
      criado_em: new Date().toISOString(),
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
    return NextResponse.json(
      { erro: "Webhook falhou" },
      { status: 500 }
    );
  }
}
