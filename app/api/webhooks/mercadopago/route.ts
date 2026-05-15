// =========================================================
// PecuariaTech
// Webhook Mercado Pago
// Next.js 16 + SSR SAFE + TypeScript
// =========================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =========================================================
// POST
// =========================================================

export async function POST(req: NextRequest) {
  try {
    // =========================================================
    // ENV VALIDATION
    // =========================================================

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const mpAccessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!supabaseUrl) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL não configurada."
      );
    }

    if (!serviceRoleKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY não configurada."
      );
    }

    if (!mpAccessToken) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN não configurado."
      );
    }

    // =========================================================
    // SUPABASE SERVER CLIENT
    // =========================================================

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // =========================================================
    // BODY
    // =========================================================

    const body = await req.json();

    console.log(
      "📩 Webhook Mercado Pago recebido:",
      body
    );

    // =========================================================
    // IGNORA EVENTOS NÃO PAYMENT
    // =========================================================

    if (
      body?.type !== "payment" ||
      !body?.data?.id
    ) {
      return NextResponse.json({
        ok: true,
      });
    }

    const paymentId = body.data.id;

    // =========================================================
    // CONSULTAR PAGAMENTO
    // =========================================================

    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!paymentRes.ok) {
      throw new Error(
        "Falha ao consultar pagamento no Mercado Pago."
      );
    }

    const payment = await paymentRes.json();

    console.log(
      "💰 Pagamento consultado:",
      payment?.id
    );

    // =========================================================
    // STATUS
    // =========================================================

    if (payment.status !== "approved") {
      return NextResponse.json({
        ok: true,
        status: payment.status,
      });
    }

    // =========================================================
    // EXTERNAL REFERENCE
    // userId|plano|periodo
    // =========================================================

    const externalRef =
      payment.external_reference;

    if (!externalRef) {
      throw new Error(
        "Pagamento sem external_reference."
      );
    }

    const [userId, plano, periodo] =
      externalRef.split("|");

    if (!userId || !plano || !periodo) {
      throw new Error(
        "external_reference inválido."
      );
    }

    // =========================================================
    // IDEMPOTÊNCIA
    // =========================================================

    const { data: jaProcessado } =
      await supabase
        .from("financeiro_logs")
        .select("id")
        .eq(
          "mercadopago_payment_id",
          paymentId
        )
        .maybeSingle();

    if (jaProcessado) {
      return NextResponse.json({
        ok: true,
        duplicado: true,
      });
    }

    // =========================================================
    // LOG FINANCEIRO
    // =========================================================

    const { error: logError } =
      await supabase
        .from("financeiro_logs")
        .insert({
          user_id: userId,
          plano,
          periodo,
          valor:
            payment.transaction_amount,
          status: "aprovado",
          mercadopago_payment_id:
            paymentId,
          raw: payment,
          criado_em:
            new Date().toISOString(),
        });

    if (logError) {
      throw logError;
    }

    // =========================================================
    // ASSINATURA
    // =========================================================

    const { error: assinaturaError } =
      await supabase
        .from("assinaturas")
        .upsert({
          user_id: userId,
          plano,
          periodo,
          status: "ativa",
          origem: "mercadopago",
          atualizado_em:
            new Date().toISOString(),
        });

    if (assinaturaError) {
      throw assinaturaError;
    }

    // =========================================================
    // SUCCESS
    // =========================================================

    return NextResponse.json({
      ok: true,
      payment_id: paymentId,
    });
  } catch (error) {
    console.error(
      "❌ WEBHOOK MERCADO PAGO ERRO:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        erro: "Webhook falhou.",
      },
      {
        status: 500,
      }
    );
  }
}