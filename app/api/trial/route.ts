import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// =====================================================
// GET /api/trial → diagnóstico
// =====================================================
export function GET() {
  return NextResponse.json(
    { status: "Rota trial ativa (use POST para ativar o trial)" },
    { status: 200 }
  );
}

// =====================================================
// POST /api/trial → ativa/renova trial por 3 dias
// =====================================================
export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "Usuário não identificado." },
        { status: 400 }
      );
    }

    const hoje = new Date();
    const expiracao = new Date();
    expiracao.setDate(hoje.getDate() + 3);

    const { data: existente } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (existente) {
      await supabase
        .from("assinaturas")
        .update({
          nivel: "premium",
          expiracao: expiracao.toISOString(),
        })
        .eq("user_id", user_id);

      return NextResponse.json({
        status: "trial_renovado",
        nivel: "premium",
        expiracao,
      });
    }

    await supabase.from("assinaturas").insert({
      user_id,
      nivel: "premium",
      expiracao: expiracao.toISOString(),
    });

    return NextResponse.json({
      status: "trial_ativado",
      nivel: "premium",
      expiracao,
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
