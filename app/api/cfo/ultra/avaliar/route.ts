// CAMINHO: app/api/cfo/ultra/avaliar/route.ts
// PecuariaTech — CFO Ultra (Motor de Avaliação)
// Etapa 4 — Base para alertas automáticos

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 🔹 Fonte Y (temporária)
    const resultado_operacional = -1250;
    const margem_percentual = 0;

    let nivel: "normal" | "atencao" | "critico" = "normal";
    let mensagem = "Operação dentro do esperado.";

    if (resultado_operacional < 0) {
      nivel = "critico";
      mensagem =
        "Resultado operacional negativo. CFO recomenda ação imediata.";
    }

    return NextResponse.json({
      status: "ok",
      sistema: "PecuariaTech CFO Ultra",
      avaliacao: {
        nivel,
        resultado_operacional,
        margem_percentual,
        mensagem,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { erro: "Falha no motor CFO Ultra" },
      { status: 500 }
    );
  }
}
