// CAMINHO: app/api/financeiro/tendencia/route.ts
// Next.js 16 + TypeScript strict
// Motor determinístico de histórico e tendência (Opção B)

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
    // PARÂMETROS
    // ===============================
    const periodo = Number(req.nextUrl.searchParams.get("meses") ?? 3);

    // ===============================
    // BUSCA HISTÓRICO FINANCEIRO
    // ===============================
    const { data, error } = await supabase
      .from("financeiro_resumo_mensal")
      .select("mes, receita, custo, lucro")
      .eq("user_id", user.id)
      .order("mes", { ascending: false })
      .limit(periodo);

    if (error || !data || data.length < 2) {
      return NextResponse.json(
        { error: "Dados insuficientes para tendência" },
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

    const tendencia =
      variacaoLucro > 5
        ? "alta"
        : variacaoLucro < -5
        ? "queda"
        : "estável";

    // ===============================
    // RESPOSTA DETERMINÍSTICA
    // ===============================
    return NextResponse.json({
      periodo_meses: periodo,
      tendencia,
      variacoes: {
        receita_percentual: Number(variacaoReceita.toFixed(2)),
        custo_percentual: Number(variacaoCusto.toFixed(2)),
        lucro_percentual: Number(variacaoLucro.toFixed(2)),
      },
      diagnostico:
        tendencia === "queda"
          ? "Redução de resultado associada ao aumento de custos ou queda de receita."
          : tendencia === "alta"
          ? "Evolução positiva sustentada por melhora operacional."
          : "Resultado financeiro estável no período analisado.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha no motor de tendência" },
      { status: 500 }
    );
  }
}
