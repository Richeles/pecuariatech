import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// =====================================================
// ROTA /api/trial
// Cria um trial de 3 dias e salva na tabela assinaturas
// =====================================================
export async function POST(request: Request) {
  const { user_id } = await request.json();

  if (!user_id) {
    return NextResponse.json(
      { error: "Usuário não identificado." },
      { status: 400 }
    );
  }

  // Definir 3 dias de trial
  const hoje = new Date();
  const expiracao = new Date();
  expiracao.setDate(hoje.getDate() + 3);

  // Verificar se já existe assinatura
  const { data: existente } = await supabase
    .from("assinaturas")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (existente) {
    // Atualizar expiração
    const { error: updateError } = await supabase
      .from("assinaturas")
      .update({
        nivel: "premium",
        expiracao: expiracao.toISOString()
      })
      .eq("user_id", user_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Não foi possível atualizar o trial." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "trial_renovado",
      nivel: "premium",
      expiracao
    });
  }

  // Criar nova assinatura trial
  const { error: insertError } = await supabase
    .from("assinaturas")
    .insert({
      user_id,
      nivel: "premium",
      expiracao: expiracao.toISOString()
    });

  if (insertError) {
    return NextResponse.json(
      { error: "Erro ao criar assinatura trial." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "trial_ativado",
    nivel: "premium",
    expiracao
  });
}
