// Next.js 16 + TypeScript strict
// Trial Básico — 5 dias (produção corrigida)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Remove assinatura anterior (regra limpa)
    await supabase
      .from("assinaturas")
      .delete()
      .eq("user_id", user_id);

    const agora = new Date();
    const fimTrial = new Date();
    fimTrial.setDate(agora.getDate() + 5);

    const PLANO_BASICO_ID = "00000000-0000-0000-0000-000000000001";

    const { error } = await supabase.from("assinaturas").insert({
      id: randomUUID(), // 🔥 CORREÇÃO CRÍTICA
      user_id,
      plano_id: PLANO_BASICO_ID,
      status: "trial",
      valor: 0,
      inicio_trial: agora.toISOString(),
      fim_trial: fimTrial.toISOString(),
      criado_em: agora.toISOString(),
    });

    if (error) {
      console.error("Erro Supabase:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      plano: "basico",
      status: "trial",
      inicio_trial: agora,
      fim_trial: fimTrial,
    });
  } catch (err) {
    console.error("Erro ao criar trial:", err);
    return NextResponse.json(
      { error: "Falha ao criar trial" },
      { status: 500 }
    );
  }
}
