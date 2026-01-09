// CAMINHO: app/api/financeiro/alertas/route.ts
// Next.js 16 + TypeScript strict
// Motor determinístico de alertas financeiros (Opção B2)

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
    // PARÂMETROS DE ALERTA (V1)
    // ===============================
    const LIMITE_QUEDA_LUCRO = -10; // %
    const LIMITE_AUMENTO_CUSTO = 15; // %
    const LIMITE_QUEDA_RECEITA = -8; // %

    // ===============================
    // BUSCA DADOS (3 MESES)
    // ===============================
    const { data, error } = await supabase
      .from("financeiro_resumo_mensal")
      .select("mes, receita, custo, lucro")
      .eq("user_id", user.id)
      .order("mes", { ascending: false })
      .limit(3);

    if (error || !data || data.length < 2) {
      return NextResponse.json(
        { error: "Dados insuficientes para alertas" },
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

    const alertas: {
      tipo: string;
      severidade: "baixa" | "media" | "alta";
      mensagem: string;
    }[] = [];

    if (variacaoLucro <= LIMITE_QUEDA_LUCRO) {
      alertas.push({
        tipo: "queda_lucro",
        severidade: "alta",
        mensagem: "Queda relevante de lucro detectada no período.",
      });
    }

    if (variacaoCusto >= LIMITE_AUMENTO_CUSTO) {
      alertas.push({
        tipo: "aumento_custo",
        severidade: "media",
        mensagem: "Aumento significativo de custos operacionais.",
      });
    }

    if (variacaoReceita <= LIMITE_QUEDA_RECEITA) {
      alertas.push({
        tipo: "queda_receita",
        severidade: "media",
        mensagem: "Redução de receita no período analisado.",
      });
    }

    return NextResponse.json({
      periodo_meses: 3,
      total_alertas: alertas.length,
      alertas,
      variacoes: {
        receita_percentual: Number(variacaoReceita.toFixed(2)),
        custo_percentual: Number(variacaoCusto.toFixed(2)),
        lucro_percentual: Number(variacaoLucro.toFixed(2)),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha no motor de alertas" },
      { status: 500 }
    );
  }
}
