// CAMINHO: app/api/pecuariatech/cfo/interpretar/route.ts
// Next.js 16 + TypeScript strict
// PecuariaTech CFO AI — Interpretação Financeira
// Equação Y preservada (server-safe)

import { NextResponse } from "next/server";

type DecisaoCFO = {
  nivel: "critico" | "atencao" | "normal";
  resultado_operacional: number;
  margem_percentual: number;
  mensagem: string;
};

function gerarRecomendacao(decisao: DecisaoCFO) {
  if (decisao.nivel === "critico") {
    return {
      prioridade: "IMEDIATA",
      acao_principal:
        "Reduzir custos operacionais e revisar fluxo de caixa.",
      recomendacoes: [
        "Suspender despesas não essenciais.",
        "Reavaliar compra de insumos.",
        "Analisar venda estratégica de animais.",
        "Negociar prazos com fornecedores.",
      ],
      horizonte: "7 dias",
    };
  }

  if (decisao.nivel === "atencao") {
    return {
      prioridade: "ALTA",
      acao_principal:
        "Ajustar custos e monitorar margens semanalmente.",
      recomendacoes: [
        "Revisar custo por animal.",
        "Ajustar manejo para ganho de eficiência.",
        "Evitar novos investimentos no curto prazo.",
      ],
      horizonte: "30 dias",
    };
  }

  return {
    prioridade: "NORMAL",
    acao_principal:
      "Manter operação e buscar otimizações graduais.",
    recomendacoes: [
      "Planejar investimentos futuros.",
      "Monitorar indicadores mensalmente.",
      "Buscar ganhos de produtividade.",
    ],
    horizonte: "90 dias",
  };
}

export async function GET(request: Request) {
  try {
    // ===============================
    // BASE URL DERIVADA DO REQUEST
    // ===============================
    const baseUrl = new URL(request.url).origin;

    // ===============================
    // 1️⃣ Buscar última decisão do CFO
    // ===============================
    const res = await fetch(
      `${baseUrl}/api/cfo/decisoes/latest`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("Falha ao consultar decisões do CFO");
    }

    const json = await res.json();

    if (!json?.decisoes || json.decisoes.length === 0) {
      throw new Error("Nenhuma decisão CFO encontrada");
    }

    const ultima: DecisaoCFO = json.decisoes[0];

    // ===============================
    // 2️⃣ Gerar interpretação
    // ===============================
    const interpretacao = gerarRecomendacao(ultima);

    // ===============================
    // 3️⃣ Resposta final
    // ===============================
    return NextResponse.json({
      status: "ok",
      origem: "PecuariaTech CFO AI",
      nivel: ultima.nivel,
      resultado_operacional: ultima.resultado_operacional,
      mensagem_cfo: ultima.mensagem,
      interpretacao,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        erro: "Erro na interpretação do CFO",
        detalhe: error.message,
      },
      { status: 500 }
    );
  }
}
