// CAMINHO: app/api/ultrachat/cfo/indicadores/route.ts
// PecuariaTech Autônomo — UltraChat CFO
// Linguagem natural + dados financeiros reais (Fonte Y)

import { NextRequest, NextResponse } from "next/server";

type Indicadores = {
  receita_total: number;
  custo_total: number;
  resultado_operacional: number;
  margem_percentual: number;
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token ausente" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { pergunta } = await req.json();

    if (!pergunta || typeof pergunta !== "string") {
      return NextResponse.json(
        { error: "Pergunta inválida" },
        { status: 400 }
      );
    }

    // ===============================
    // BUSCAR INDICADORES REAIS (Fonte Y)
    // ===============================
    const indicadoresResp = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/financeiro/indicadores-avancados`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!indicadoresResp.ok) {
      return NextResponse.json(
        { error: "Falha ao obter dados financeiros" },
        { status: 500 }
      );
    }

    const json = await indicadoresResp.json();
    const indicadores: Indicadores = json.indicadores;

    // ===============================
    // MOTOR DE INTERPRETAÇÃO (V1)
    // ===============================
    let resposta = "Analisando seus números financeiros, ";

    if (indicadores.resultado_operacional < 0) {
      resposta +=
        "o resultado está negativo. Recomendo atenção imediata aos custos operacionais e revisão de despesas recorrentes.";
    } else if (indicadores.margem_percentual < 10) {
      resposta +=
        "a margem está baixa. Há espaço para melhorar eficiência ou renegociar insumos.";
    } else {
      resposta +=
        "o desempenho financeiro é saudável. O foco agora deve ser consistência e escala controlada.";
    }

    resposta += ` Atualmente, sua margem é de ${indicadores.margem_percentual.toFixed(
      2
    )}% e o resultado operacional é de R$ ${indicadores.resultado_operacional.toFixed(
      2
    )}.`;

    // ===============================
    // RESPOSTA FINAL
    // ===============================
    return NextResponse.json({
      status: "ok",
      pergunta,
      resposta,
      base: "dados financeiros reais do usuário",
    });
  } catch (err) {
    console.error("UltraChat CFO erro:", err);
    return NextResponse.json(
      { error: "Erro interno do UltraChat CFO" },
      { status: 500 }
    );
  }
}
