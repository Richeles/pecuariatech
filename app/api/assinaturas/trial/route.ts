// CAMINHO: app/api/assinaturas/trial/route.ts
// Next.js 16 + TypeScript strict
// Trial automático — Plano Básico (5 dias)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id } = body;

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

    const trialFim = new Date();
    trialFim.setDate(trialFim.getDate() + 5);

    const { error } = await supabase.from("assinaturas").insert({
      user_id,
      plano: "basico",
      periodo: "trial",
      status: "trial",
      trial_fim: trialFim.toISOString(),
    });

    if (error) {
      console.error("Erro Supabase:", error);
      return NextResponse.json(
        { error: "Falha ao criar trial" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plano: "basico",
      periodo: "trial",
      trial_fim: trialFim.toISOString(),
    });
  } catch (err) {
    console.error("Erro geral:", err);
    return NextResponse.json(
      { error: "Erro inesperado" },
      { status: 500 }
    );
  }
}
