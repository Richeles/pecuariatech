// app/api/checkout/webhook/route.ts
// Next.js 16 + TS strict
// Webhook Mercado Pago — Ativação de Assinatura + Auditoria Financeira
// Equação Y + Triângulo 360
//
// ✅ Regra anti-build-break:
// - NUNCA validar env ou instanciar MercadoPagoConfig no topo do arquivo
// - tudo dentro do handler (runtime only)

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// helper: resposta safe
function jsonNoStore(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // ================================
    // ✅ VALIDAR VARIÁVEIS (RUNTIME ONLY)
    // ================================
    const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SB_SERVICE =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

    if (!MP_TOKEN) {
      // ❗ não quebra build, falha só em runtime
      return jsonNoStore({ ok: false, error: "missing_env_mp" }, 500);
    }
    if (!SB_URL) {
      return jsonNoStore({ ok: false, error: "missing_env_supabase_url" }, 500);
    }
    if (!SB_SERVICE) {
      return jsonNoStore({ ok: false, error: "missing_env_supabase_service_role" }, 500);
    }

    // ================================
    // BODY
    // ================================
    const body = await req.json().catch(() => null);

    // Compatibilidade Mercado Pago
    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split("/")?.pop();

    if (!paymentId) {
      // MercadoPago pode pingar sem id, não é erro.
      return jsonNoStore({ ok: true, ignored: true, reason: "no_payment_id" }, 200);
    }

    // ================================
    // MERCADO PAGO (runtime only)
    // ================================
    const mp = new MercadoPagoConfig({ accessToken: MP_TOKEN });
    const payment = new Payment(mp);

    const paymentInfo = await payment.get({ id: paymentId });

    if (paymentInfo?.status !== "approved") {
      return jsonNoStore({
        ok: true,
        ignored: true,
        status: paymentInfo?.status ?? "unknown",
      });
    }

    const externalReference = paymentInfo.external_reference;
    if (!externalReference) {
      return jsonNoStore({ ok: false, error: "external_reference_missing" }, 400);
    }

    // user_id|plano|periodo
    const [user_id, plano, periodo] = String(externalReference).split("|");

    if (!user_id || !plano || !periodo) {
      return jsonNoStore({ ok: false, error: "external_reference_invalid" }, 400);
    }

    // ================================
    // SUPABASE (runtime only)
    // ================================
    const supabase = createClient(SB_URL, SB_SERVICE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ================================
    // PERÍODO
    // ================================
    const inicio = new Date();
    const fim = new Date(inicio);

    if (periodo === "mensal") fim.setMonth(fim.getMonth() + 1);
    else if (periodo === "trimestral") fim.setMonth(fim.getMonth() + 3);
    else if (periodo === "anual") fim.setFullYear(fim.getFullYear() + 1);
    else {
      return jsonNoStore({ ok: false, error: "periodo_invalido" }, 400);
    }

    // ================================
    // ATIVAR ASSINATURA PAGA
    // ================================
    // ⚠️ Importante: seu sistema atual usa status === 'ativa' (memória do middleware)
    // então vamos padronizar como 'ativa' para não quebrar paywall.
    const { error: assinaturaError } = await supabase.from("assinaturas").insert({
      user_id,
      plano, // string slug (seu modelo atual)
      periodo,
      status: "ativa",
      origem: "mercadopago",
      inicio,
      fim,
      external_reference: externalReference,
      payment_id: String(paymentId),
      valor: Number(paymentInfo.transaction_amount ?? 0),
    });

    if (assinaturaError) {
      return jsonNoStore(
        { ok: false, error: "assinatura_insert_failed", details: assinaturaError.message },
        500
      );
    }

    // ================================
    // AUDITORIA FINANCEIRA (LOG)
    // ================================
    await supabase.from("financeiro_logs").insert({
      user_id,
      plano,
      periodo,
      valor: Number(paymentInfo.transaction_amount ?? 0),
      moeda: paymentInfo.currency_id ?? "BRL",
      origem: "mercadopago",
      evento: "pagamento_aprovado",
      payment_id: String(paymentId),
      external_reference: externalReference,
    });

    return jsonNoStore({ ok: true });
  } catch (err: any) {
    console.error("Webhook Mercado Pago ERROR:", err);
    return jsonNoStore(
      { ok: false, error: err?.message ?? "Erro no webhook" },
      500
    );
  }
}
