// CAMINHO: app/api/mercadopago/webhook/route.ts
// Webhook Mercado Pago — Ativação automática de assinatura
// Next.js 16 + TypeScript strict
// Equação Y aplicada

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MP_API = "https://api.mercadopago.com/v1/payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId = body?.data?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    // ================================
    // CONSULTAR PAGAMENTO REAL
    // ================================
    const mpRes = await fetch(`${MP_API}/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!mpRes.ok) {
      throw new Error("Falha ao consultar pagamento MP");
    }

    const pagamento = await mpRes.json();

    if (pagamento.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    /**
     * external_reference esperado:
     * userId|plano|periodo
     * Ex: 9d2f-uuid|ultra|mensal
     */
    const ref = pagamento.external_reference;
    if (!ref) {
      throw new Error("external_reference ausente");
    }

    const [user_id, plano, periodo] = ref.split("|");

    // ================================
    // SUPABASE (SERVER ONLY)
    // ================================
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ================================
    // ATIVAR ASSINATURA
    // ================================
    await supabase.from("assinaturas").upsert({
      user_id,
      plano,
      periodo,
      ativo: true,
      troca_agendada: false,
      proximo_plano: null,
    });

    // ================================
    // LOG FINANCEIRO
    // ================================
    await supabase.from("logs_financeiros").insert({
      user_id,
      tipo: "PAGAMENTO_APROVADO",
      plano_origem: null,
      plano_destino: plano,
      referencia_externa: paymentId,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro webhook MP:", err);
    return NextResponse.json(
      { erro: "Erro no webhook Mercado Pago" },
      { status: 500 }
    );
  }
}
