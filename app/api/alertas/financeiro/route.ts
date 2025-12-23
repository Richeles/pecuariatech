// app/api/alertas/financeiro/route.ts
// Next.js 16 | Produção-ready | PecuariaTech

// 🔴 OBRIGATÓRIO: forçar Node.js runtime para acesso a process.env
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // ============================
    // 1️⃣ VALIDAR AMBIENTE
    // ============================
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        {
          erro: "Variáveis TELEGRAM não configuradas",
        },
        { status: 500 }
      );
    }

    // ============================
    // 2️⃣ DADO FINANCEIRO (TEMPORÁRIO)
    // Depois ligar no Supabase
    // ============================
    const resultadoOperacional = -1250;

    // ============================
    // 3️⃣ SEM PROBLEMA → SEM ALERTA
    // ============================
    if (resultadoOperacional >= 0) {
      return NextResponse.json({
        status: "ok",
        mensagem: "Nenhum alerta financeiro necessário",
      });
    }

    // ============================
    // 4️⃣ MENSAGEM CFO
    // ============================
    const texto =
      "🚨 *ALERTA FINANCEIRO — PecuariaTech*\n\n" +
      "Resultado operacional negativo detectado.\n\n" +
      `📉 Resultado: R$ ${resultadoOperacional.toLocaleString("pt-BR")}\n\n` +
      "👉 *Recomendação imediata:*\n" +
      "Revisar custos operacionais e sanitários.";

    // ============================
    // 5️⃣ ENVIO TELEGRAM
    // ============================
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: texto,
          parse_mode: "Markdown",
        }),
      }
    );

    const telegramResult = await response.json();

    if (!telegramResult.ok) {
      throw new Error(
        `Falha no envio para Telegram: ${telegramResult.description}`
      );
    }

    // ============================
    // 6️⃣ SUCESSO
    // ============================
    return NextResponse.json({
      status: "alerta_enviado",
      canal: "telegram",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro alerta financeiro:", error);

    return NextResponse.json(
      {
        erro: "Erro interno ao processar alerta financeiro",
      },
      { status: 500 }
    );
  }
}
