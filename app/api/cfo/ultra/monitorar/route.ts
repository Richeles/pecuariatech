// CAMINHO: app/api/cfo/ultra/monitorar/route.ts
// Next.js 16 + TypeScript strict
// Orquestrador CFO Ultra → Alertas
// Equação Y preservada

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // =====================================
    // BASE URL DERIVADA DO REQUEST (SERVER)
    // =====================================
    const baseUrl = new URL(request.url).origin;

    // =====================================
    // 1️⃣ CHAMAR CFO ULTRA (ÂNCORA)
    // =====================================
    const avaliarRes = await fetch(
      `${baseUrl}/api/cfo/ultra/avaliar`,
      {
        cache: "no-store",
        headers: {
          // 🔐 Header interno para bypass do middleware
          "x-internal-call": "cfo-monitorar",
        },
      }
    );

    if (!avaliarRes.ok) {
      throw new Error("Falha ao consultar CFO Ultra");
    }

    const avaliacao = await avaliarRes.json();

    // =====================================
    // 2️⃣ VALIDAR ESTRUTURA
    // =====================================
    if (!avaliacao?.avaliacao || !avaliacao.avaliacao.nivel) {
      throw new Error("Resposta inválida do CFO Ultra");
    }

    // =====================================
    // 3️⃣ SE CRÍTICO → ENVIAR ALERTA
    // =====================================
    if (avaliacao.avaliacao.nivel === "critico") {
      const alertaRes = await fetch(
        `${baseUrl}/api/cfo/alertas/enviar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 🔐 Mantém padrão interno
            "x-internal-call": "cfo-monitorar",
          },
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

    // =====================================
    // 4️⃣ CASO NÃO CRÍTICO
    // =====================================
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
