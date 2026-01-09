// CAMINHO: app/api/financeiro/narrativa/route.ts
// Next.js 16 + TypeScript strict
// Motor de narrativa financeira (Opção B3)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token não informado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida" },
        { status: 401 }
      );
    }

    // ===============================
    // BUSCA DADOS BASE (3 MESES)
    // ===============================
    const { data, error } = await supabase
      .from("financeiro_resumo_mensal")
      .select("mes, receita, custo, lucro")
      .eq("user_id", user.id)
      .order("mes", { ascending: false })
      .limit(3);

    if (error || !data || data.length < 2) {
      return NextResponse.json(
        { error: "Dados insuficientes para narrativa" },
        { status: 400 }
      );
    }

    const atual = data[0];
    const anterior = data[data.length - 1];

    const variacaoReceita =
      ((atual.receita - anterior.receita) / anterior.receita) * 100;

    const variacaoCusto =
      ((atual.custo - anterior.custo) / anterior.custo) * 100;

    const variacaoLucro =
      ((atual.lucro - anterior.lucro) / anterior.lucro) * 100;

    // ===============================
    // CLASSIFICAÇÃO CFO
    // ===============================
    let classificacao: "positiva" | "neutra" | "negativa";
    let narrativa: string;

    if (variacaoLucro > 5) {
      classificacao = "positiva";
      narrativa =
        "O resultado financeiro apresenta evolução positiva no período analisado. " +
        "A operação demonstra boa eficiência, com geração de lucro crescente e controle adequado dos custos.";
    } else if (variacaoLucro < -5) {
      classificacao = "negativa";
      narrativa =
        "O desempenho financeiro indica deterioração no período recente. " +
        "A redução do lucro sugere necessidade de atenção imediata aos custos operacionais ou à receita.";
    } else {
      classificacao = "neutra";
      narrativa =
        "O resultado financeiro manteve-se relativamente estável no período analisado. " +
        "Apesar da ausência de crescimento expressivo, a operação não apresenta sinais críticos no momento.";
    }

    // ===============================
    // COMPLEMENTO EXPLICATIVO
    // ===============================
    const complemento =
      variacaoCusto > variacaoReceita
        ? "Observa-se que os custos cresceram em ritmo superior à receita, pressionando a margem."
        : "A receita acompanhou ou superou a variação dos custos, contribuindo para a estabilidade do resultado.";

    return NextResponse.json({
      periodo_meses: 3,
      classificacao_cfo: classificacao,
      narrativa_principal: narrativa,
      complemento,
      variacoes: {
        receita_percentual: Number(variacaoReceita.toFixed(2)),
        custo_percentual: Number(variacaoCusto.toFixed(2)),
        lucro_percentual: Number(variacaoLucro.toFixed(2)),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha no motor de narrativa CFO" },
      { status: 500 }
    );
  }
}
