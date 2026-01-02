// Next.js 16 + TypeScript strict
// Trial Básico — 5 dias (produção robusta)

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // ===============================
    // PARSE + VALIDAÇÃO
    // ===============================
    const body = await req.json().catch(() => null);
    const user_id = body?.user_id;

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json(
        { error: "user_id é obrigatório e deve ser string" },
        { status: 400 }
      );
    }

    // ===============================
    // CLIENT SUPABASE (SERVICE ROLE)
    // ===============================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
      }
    );

    // ===============================
    // REMOVE ASSINATURA ANTERIOR
    // ===============================
    const { error: deleteError } = await supabase
      .from("assinaturas")
      .delete()
      .eq("user_id", user_id);

    if (deleteError) {
      console.error("❌ Erro DELETE:", deleteError);
      return NextResponse.json(
        {
          error: "Erro ao limpar assinatura anterior",
          details: deleteError.message,
          code: deleteError.code,
        },
        { status: 500 }
      );
    }

    // ===============================
    // CALCULA PERÍODO DE TRIAL
    // ===============================
    const agora = new Date();
    const fimTrial = new Date(agora);
    fimTrial.setDate(fimTrial.getDate() + 5);

    // ⚠️ UUID REAL DO PLANO BÁSICO
    const PLANO_BASICO_ID = "00000000-0000-0000-0000-000000000001";

    // ===============================
    // INSERT COM DEBUG EXPLÍCITO
    // ===============================
    const { data, error: insertError } = await supabase
      .from("assinaturas")
      .insert({
        id: randomUUID(),
        user_id,
        plano_id: PLANO_BASICO_ID,
        status: "trial",
        metodo_pagamento: "trial",
        valor: 0,
        inicio_trial: agora.toISOString(),
        fim_trial: fimTrial.toISOString(),
        criado_em: agora.toISOString(),
      })
      .select();

    if (insertError) {
      console.error("🔥 ERRO INSERT SUPABASE:", insertError);
      return NextResponse.json(
        {
          error: "Erro Supabase ao criar trial",
          details: insertError.message,
          hint: insertError.hint,
          code: insertError.code,
        },
        { status: 500 }
      );
    }

    // ===============================
    // SUCESSO
    // ===============================
    return NextResponse.json({
      success: true,
      assinatura_id: data?.[0]?.id,
      user_id,
      plano: "basico",
      status: "trial",
      inicio_trial: agora.toISOString(),
      fim_trial: fimTrial.toISOString(),
    });
  } catch (err) {
    console.error("🔥 ERRO FATAL INESPERADO:", err);
    return NextResponse.json(
      {
        error: "Erro inesperado no servidor",
        message:
          err instanceof Error ? err.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
