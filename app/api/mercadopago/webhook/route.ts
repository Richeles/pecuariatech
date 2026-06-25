// CAMINHO: app/api/mercadopago/webhook/route.ts
// Webhook Mercado Pago — Ativação automática de assinatura
// Compatível com testes do Mercado Pago (paymentId = "123456")

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MP_API = "https://api.mercadopago.com/v1/payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId = body?.data?.id;

    // ✅ SE FOR TESTE (ID FICTÍCIO), RETORNA 200 IMEDIATAMENTE
    if (!paymentId || paymentId === "123456") {
      console.log("[Webhook] Teste do Mercado Pago recebido – ignorando.");
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
      console.error("[Webhook] Erro ao consultar pagamento MP:", await mpRes.text());
      throw new Error("Falha ao consultar pagamento MP");
    }

    const pagamento = await mpRes.json();

    if (pagamento.status !== "approved") {
      console.log(`[Webhook] Pagamento ${paymentId} status: ${pagamento.status}`);
      return NextResponse.json({ ok: true });
    }

    const ref = pagamento.external_reference;
    if (!ref) {
      console.error("[Webhook] external_reference ausente");
      throw new Error("external_reference ausente");
    }

    // ================================
    // EXTRAIR DADOS (JSON ou PIPE)
    // ================================
    let user_id: string;
    let plano: string;

    try {
      const parsed = JSON.parse(ref);
      user_id = parsed.user_id || parsed.userId;
      plano = parsed.plano;
      if (!user_id || !plano) throw new Error("JSON incompleto");
    } catch {
      const partes = ref.split("|");
      if (partes.length >= 2) {
        user_id = partes[0];
        plano = partes[1];
      } else {
        throw new Error(`external_reference inválido: ${ref}`);
      }
    }

    console.log(`[Webhook] ✅ Pagamento aprovado: user=${user_id}, plano=${plano}`);

    // ================================
    // SUPABASE
    // ================================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const agora = new Date().toISOString();

    // ================================
    // VERIFICAR SE JÁ EXISTE ASSINATURA
    // ================================
    const { data: existing } = await supabase
      .from("assinaturas")
      .select("user_id")
      .eq("user_id", user_id)
      .maybeSingle();

    let result;

    if (existing) {
      // UPDATE
      result = await supabase
        .from("assinaturas")
        .update({
          plano,
          status: "ativa",
          renovacao_em: agora,
          troca_agendada: false,
          proximo_plano: null,
          atualizado_em: agora,
        })
        .eq("user_id", user_id);
    } else {
      // INSERT
      result = await supabase.from("assinaturas").insert({
        id: crypto.randomUUID(),
        user_id,
        plano,
        status: "ativa",
        criado_em: agora,
        renovacao_em: agora,
        troca_agendada: false,
        proximo_plano: null,
        created_at: agora,
        updated_at: agora,
      });
    }

    if (result.error) {
      console.error("[Webhook] Erro ao salvar assinatura:", result.error);
      throw new Error("Erro ao salvar assinatura");
    }

    // ================================
    // LOG FINANCEIRO (opcional)
    // ================================
    const { error: logError } = await supabase
      .from("logs_financeiros")
      .insert({
        user_id,
        tipo: "PAGAMENTO_APROVADO",
        plano_destino: plano,
        referencia_externa: paymentId,
      });

    if (logError) {
      console.warn("[Webhook] Erro ao inserir log:", logError.message);
    }

    console.log(`[Webhook] ✅ Plano ${plano} ativado para ${user_id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Webhook] Erro:", err);
    return NextResponse.json(
      { erro: "Erro no webhook", detalhe: String(err) },
      { status: 500 }
    );
  }
}