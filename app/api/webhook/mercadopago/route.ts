// app/api/webhook/mercadopago/route.ts
// Versão segura: preços do banco, sem upsert (usa select/insert)

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
const paymentClient = new Payment(mp);

async function getPrecosFromDatabase(plano: string) {
  const { data } = await supabase
    .from("planos_precos")
    .select("preco_mensal, preco_trimestral, preco_anual")
    .eq("plano_codigo", plano)
    .maybeSingle();
  if (!data) return null;
  return { mensal: data.preco_mensal, trimestral: data.preco_trimestral, anual: data.preco_anual };
}

function parseExternalReference(ref: string | null) {
  if (!ref) return null;
  const [user_id, plano, periodo] = ref.split("|");
  if (!user_id || !plano || !periodo) return null;
  return { user_id, plano, periodo };
}

function isValidValue(esperado: number, recebido: number) {
  return Math.abs(recebido - esperado) < 0.1;
}

function calcularRenovacao(periodo: string) {
  const renovacao = new Date();
  if (periodo === "mensal") renovacao.setMonth(renovacao.getMonth() + 1);
  if (periodo === "trimestral") renovacao.setMonth(renovacao.getMonth() + 3);
  if (periodo === "anual") renovacao.setFullYear(renovacao.getFullYear() + 1);
  return renovacao.toISOString();
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const paymentId = body?.data?.id;
    const eventType = body?.type;
    console.log("🔥 WEBHOOK CHAMADO", { paymentId, eventType });
    if (!paymentId || eventType !== "payment") return NextResponse.json({ ok: true, ignored: true });

    const payment = await paymentClient.get({ id: paymentId });
    if (!payment) return NextResponse.json({ ok: false, error: "payment_not_found" }, { status: 404 });

    const status = payment.status;
    const externalRef = payment.external_reference;
    const valorPago = Number(payment.transaction_amount);
    const moeda = payment.currency_id ?? "BRL";

    const parsed = parseExternalReference(externalRef);
    if (!parsed) return NextResponse.json({ ok: false, error: "invalid_external_reference" }, { status: 400 });
    const { user_id, plano, periodo } = parsed;

    const precos = await getPrecosFromDatabase(plano);
    if (!precos) return NextResponse.json({ ok: false, error: "plan_not_found" }, { status: 400 });
    const precoEsperado = precos[periodo as keyof typeof precos];
    if (!precoEsperado) return NextResponse.json({ ok: false, error: "invalid_period" }, { status: 400 });
    if (!isValidValue(precoEsperado, valorPago)) {
      return NextResponse.json({ ok: false, error: "valor_mismatch", esperado: precoEsperado, recebido: valorPago }, { status: 400 });
    }
    if (moeda !== "BRL") return NextResponse.json({ ok: false, error: "currency_mismatch", moeda }, { status: 400 });

    // Idempotência: verifica se log já existe
    const { data: existingLog } = await supabase.from("financeiro_logs").select("id").eq("payment_id", paymentId).maybeSingle();
    if (existingLog) return NextResponse.json({ ok: true, idempotent: true });

    // Insere log financeiro
    await supabase.from("financeiro_logs").insert({
      payment_id: paymentId, user_id, plano, periodo, valor: valorPago, moeda,
      origem: "mercadopago", evento: status, external_reference: externalRef, criado_em: new Date().toISOString(),
    });

    if (status === "approved") {
      const renovacao_em = calcularRenovacao(periodo);
      const assinaturaData = { status: "ativa", plano, nivel: plano, valor: valorPago, metodo_pagamento: "mercadopago", renovacao_em, expires_at: renovacao_em, updated_at: new Date().toISOString() };
      const { data: existingAssinatura } = await supabase.from("assinaturas").select("id").eq("user_id", user_id).maybeSingle();
      if (existingAssinatura) {
        await supabase.from("assinaturas").update(assinaturaData).eq("id", existingAssinatura.id);
      } else {
        await supabase.from("assinaturas").insert({ user_id, ...assinaturaData, criado_em: new Date().toISOString() });
      }
    }

    console.log(`✅ Webhook processado em ${Date.now() - startTime}ms`);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: "webhook_failure" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "mercadopago_webhook", status: "alive" });
}
