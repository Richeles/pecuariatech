// CAMINHO: app/api/cfo/ultra/monitorar/route.ts
// Next.js 16 + TypeScript strict
// Orquestrador CFO Ultra → Alertas
// Equação Y preservada

import { NextResponse } from "next/server";

// ===============================
// RESOLUÇÃO ROBUSTA DA BASE URL
// (SERVER-SIDE SAFE)
// ===============================
function getBaseUrl(): string {
  // 1️⃣ Prioridade absoluta (server explícito)
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  // 2️⃣ Compatibilidade com config existente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 3️⃣ Fallback automático Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  throw new Error("Base URL não configurada no ambiente");
}

export async function GET() {
  try {
    const baseUrl = getBaseUrl();

    // ===============================
    // 1️⃣ Chamar CFO Ultra (ÂNCORA)
    // ===============================
    const avaliarRes = await fetch(
      `${baseUrl}/api/cfo/ultra/avaliar`,
      { cache: "no-store" }
    );

    if (!avaliarRes.ok) {
      throw new Error("Falha ao consultar CFO Ultra");
    }

    const avaliacao = await avaliarRes.json();

    // ===============================
    // 2️⃣ Validar estrutura mínima
    // ===============================
    if (!avaliacao?.avaliacao || !avaliacao.avaliacao.nivel) {
      throw new Error("Resposta inválida do CFO Ultra");
    }

    // ===============================
    // 3️⃣ Se crítico → enviar alerta
    // ===============================
    if (avaliacao.avaliacao.nivel === "critico") {
      const alertaRes = await fetch(
        `${baseUrl}/api/cfo/alertas/enviar`,
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

    // ===============================
    // 4️⃣ Caso não crítico
    // ===============================
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
