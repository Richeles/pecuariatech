// Next.js 16 + TypeScript strict
// Trial Básico — 5 dias (produção estável)

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id } = body ?? {};

    // ===============================
    // VALIDAÇÃO FORTE
    // ===============================
    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // ===============================
    // LIMPA ASSINATURA ANTERIOR (IDEMPOTENTE)
    // ===============================
    const { error: deleteError } = await supabase
      .from("assinaturas")
      .delete()
      .eq("user_id", user_id);

    if (deleteError) {
      console.error("Erro ao remover assinatura anterior:", deleteError);
      throw deleteError;
    }

    // ===============================
    // CALCULA TRIAL
    // ===============================
    const agora = new Date();
    const fimTrial = new Date(agora);
    fimTrial.setDate(fimTrial.getDate() + 5);

    const PLANO_BASICO_ID = "00000000-0000-0000-0000-000000000001";

    // ===============================
    // INSERE NOVA ASSINATURA
    // ===============================
    const { error: insertError } = await supabase
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
      });

    if (insertError) {
      console.error("Erro ao inserir trial:", insertError);
      throw insertError;
    }

    // ===============================
    // SUCESSO
    // ===============================
    return NextResponse.json({
      success: true,
      plano: "basico",
      status: "trial",
      inicio_trial: agora.toISOString(),
      fim_trial: fimTrial.toISOString(),
    });
  } catch (err) {
    console.error("Erro fatal ao criar trial:", err);
    return NextResponse.json(
      { error: "Falha ao criar trial" },
      { status: 500 }
    );
  }
}
