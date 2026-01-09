// CAMINHO: app/api/alertas/financeiro-v2/route.ts
// Next.js 16 | Produção-ready | PecuariaTech
// Rota NOVA para quebrar cache antigo da Vercel

import { NextResponse } from "next/server";

// 🔒 OBRIGATÓRIO para uso de process.env na Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ============================
    // 1️⃣ VARIÁVEIS (FONTE ÚNICA)
    // ============================
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        { erro: "Variáveis TELEGRAM não configuradas (Production)" },
        { status: 500 }
      );
    }

    // ============================
    // 2️⃣ DADO FINANCEIRO (FIXO)
    // ============================
    const resultadoOperacional = -1250;

    if (resultadoOperacional >= 0) {
      return NextResponse.json({
        status: "ok",
        mensagem: "Nenhum alerta financeiro necessário",
      });
    }

    // ============================
    // 3️⃣ MENSAGEM CFO
    // ============================
    const texto =
      "🚨 *ALERTA FINANCEIRO — PecuariaTech*\n\n" +
      "Resultado operacional negativo detectado.\n\n" +
      `📉 Resultado: R$ ${resultadoOperacional.toLocaleString("pt-BR")}\n\n` +
      "👉 *Ação recomendada:*\n" +
      "Revisar custos operacionais e sanitários.";

    // ============================
    // 4️⃣ ENVIO TELEGRAM
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
      return NextResponse.json(
        {
          erro: "Falha ao enviar para Telegram",
          detalhe: telegramResult,
        },
        { status: 500 }
      );
    }

    // ============================
    // 5️⃣ SUCESSO
    // ============================
    return NextResponse.json({
      status: "alerta_enviado",
      canal: "telegram",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro alerta financeiro:", error);

    return NextResponse.json(
      { erro: "Erro interno no alerta financeiro" },
      { status: 500 }
    );
  }
}
