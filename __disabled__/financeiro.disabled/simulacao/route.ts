// app/api/financeiro/simulacao/route.ts
// Next.js 16 + TypeScript strict
// C3.5.4 — Simulação Financeira Harvan
// Runtime-only | Equação Y aplicada

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SimulacaoInput = {
  aumento_custo_percentual?: number;
  aumento_receita_percentual?: number;
  ebitda_atual: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SimulacaoInput;

    const {
      aumento_custo_percentual = 0,
      aumento_receita_percentual = 0,
      ebitda_atual,
    } = body;

    const novoEbitda =
      ebitda_atual *
      (1 + (aumento_receita_percentual - aumento_custo_percentual) / 100);

    return NextResponse.json({
      ebitda_simulado: Number(novoEbitda.toFixed(2)),
      impacto_percentual:
        aumento_receita_percentual - aumento_custo_percentual,
    });
  } catch (error) {
    console.error("Erro simulação:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
