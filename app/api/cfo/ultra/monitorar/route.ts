// CAMINHO: app/api/cfo/ultra/monitorar/route.ts
// Next.js 16 + TypeScript strict
// Orquestrador CFO Ultra → Alertas
// Equação Y preservada

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1️⃣ Chamar CFO Ultra (âncora)
    const avaliarRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/cfo/ultra/avaliar`,
      { cache: "no-store" }
    );

    if (!avaliarRes.ok) {
      throw new Error("Falha ao consultar CFO Ultra");
    }

    const avaliacao = await avaliarRes.json();

    // 2️⃣ Validar estrutura mínima
    if (
      !avaliacao?.avaliacao ||
      !avaliacao.avaliacao.nivel
    ) {
      throw new Error("Resposta inválida do CFO Ultra");
    }

    // 3️⃣ Se crítico → enviar alerta
    if (avaliacao.avaliacao.nivel === "critico") {
      const alertaRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/cfo/alertas/enviar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origem: "CFO Ultra",
            nivel: avaliacao.avaliacao.nivel,
            mensagem: avaliacao.avaliacao.mensagem,
            resultado_operacional:
              avaliacao.avaliacao.resultado_operacional,
          }),
        }
      );

      if (!alertaRes.ok) {
        throw new Error("Falha ao enviar alerta CFO");
      }

      return NextResponse.json({
        status: "alerta_enviado",
        avaliacao: avaliacao.avaliacao,
      });
    }

    // 4️⃣ Caso não crítico
    return NextResponse.json({
      status: "sem_alerta",
      avaliacao: avaliacao.avaliacao,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        erro: "Erro no monitoramento CFO",
        detalhe: error.message,
      },
      { status: 500 }
    );
  }
}
