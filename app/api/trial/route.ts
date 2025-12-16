import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// Supabase — server only (runtime)
// =====================================================
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// =====================================================
// GET /api/trial → diagnóstico
// =====================================================
export function GET() {
  return NextResponse.json(
    {
      status: "Rota trial ativa",
      metodo: "POST para ativar ou renovar trial",
      duracao_dias: 5,
    },
    { status: 200 }
  );
}

// =====================================================
// POST /api/trial → cria ou renova trial (5 dias)
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const { user_id, plano_codigo } = await req.json();

    if (!user_id || !plano_codigo) {
      return NextResponse.json(
        { error: "user_id e plano_codigo são obrigatórios" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // Valida plano (Equação Y)
    // ---------------------------------------------------
    const { data: plano, error: planoError } = await supabase
      .from("planos_precos_view")
      .select("codigo, nome_exibicao")
      .eq("codigo", plano_codigo)
      .single();

    if (planoError || !plano) {
      return NextResponse.json(
        { error: "Plano inválido" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // Datas
    // ---------------------------------------------------
    const agora = new Date();
    const fimTrial = new Date();
    fimTrial.setDate(agora.getDate() + 5);

    // ---------------------------------------------------
    // Busca assinatura existente
    // ---------------------------------------------------
    const { data: existente } = await supabase
      .from("assinaturas")
      .select("id, status")
      .eq("user_id", user_id)
      .maybeSingle();

    // ---------------------------------------------------
    // RENOVA trial (somente se não for paga)
    // ---------------------------------------------------
    if (existente && existente.status !== "ativa") {
      const { error } = await supabase
        .from("assinaturas")
        .update({
          plano_codigo,
          status: "trial",
          origem: "trial",
          fim_trial: fimTrial.toISOString(),
          atualizado_em: agora.toISOString(),
        })
        .eq("user_id", user_id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: "trial_renovado",
        plano: plano.nome_exibicao,
        fim_trial: fimTrial,
      });
    }

    // ---------------------------------------------------
    // CRIA novo trial
    // ---------------------------------------------------
    if (!existente) {
      const { data: assinatura, error } = await supabase
        .from("assinaturas")
        .insert({
          user_id,
          plano_codigo,
          status: "trial",
          origem: "trial",
          inicio_em: agora.toISOString(),
          fim_trial: fimTrial.toISOString(),
        })
        .select("*")
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: "trial_ativado",
        plano: plano.nome_exibicao,
        fim_trial: fimTrial,
        assinatura,
      });
    }

    // ---------------------------------------------------
    // Assinatura ativa → não permitir trial
    // ---------------------------------------------------
    return NextResponse.json(
      { error: "Usuário já possui assinatura ativa" },
      { status: 409 }
    );

  } catch (err) {
    console.error("Erro trial:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar trial" },
      { status: 500 }
    );
  }
}
