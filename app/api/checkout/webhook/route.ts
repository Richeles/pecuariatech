// app/api/checkout/webhook/route.ts
// Next.js 16 + TypeScript strict

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import MercadoPagoConfig, { Payment } from "mercadopago";

export const runtime = "nodejs";

// ======================================================
// POST /api/checkout/webhook
// ======================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Mercado Pago envia vários eventos
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data.id;

    // ======================================================
    // MERCADO PAGO (PRODUÇÃO)
    // ======================================================
    const mp = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    });

    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // ======================================================
    // METADATA (alinhada ao checkout C1)
    // ======================================================
    const { plano_id } = paymentData.metadata || {};

    if (!plano_id) {
      console.error("Webhook: metadata.plano_id ausente");
      return NextResponse.json({ ok: true });
    }

    // ======================================================
    // SUPABASE (SERVICE ROLE — SERVER ONLY)
    // ======================================================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ======================================================
    // ATIVAR ASSINATURA (MODELO ATUAL DO PROJETO)
    // ======================================================
    const { error } = await supabase.from("assinaturas").insert({
      plano_codigo: plano_id,
      status: "ativo",
      origem: "mercado_pago",
      payment_id: paymentId,
      criado_em: new Date().toISOString(),
    });

    if (error) {
      console.error("Erro ao ativar assinatura:", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro webhook Mercado Pago:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
