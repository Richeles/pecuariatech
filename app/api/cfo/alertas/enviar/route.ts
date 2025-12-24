// CAMINHO: app/api/cfo/alertas/enviar/route.ts
// Next.js 16 + TypeScript strict
// Envio de alertas CFO (Telegram)
// Equação Y preservada

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      origem,
      nivel,
      mensagem,
      resultado_operacional,
    } = body;

    // ===============================
    // VALIDAÇÃO MÍNIMA
    // ===============================
    if (!origem || !nivel || !mensagem) {
      return NextResponse.json(
        { erro: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    // ===============================
    // VARIÁVEIS TELEGRAM
    // ===============================
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { erro: "Variáveis TELEGRAM não configuradas" },
        { status: 500 }
      );
    }

    // ===============================
    // MENSAGEM FORMATADA
    // ===============================
    const texto = `
🚨 *ALERTA CFO – PecuariaTech*

Origem: ${origem}
Nível: ${nivel}
Resultado Operacional: ${resultado_operacional}

${mensagem}
`.trim();

    // ===============================
    // ENVIO TELEGRAM
    // ===============================
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: texto,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!telegramRes.ok) {
      throw new Error("Falha ao enviar mensagem ao Telegram");
    }

    return NextResponse.json({ status: "alerta_enviado" });
  } catch (error: any) {
    return NextResponse.json(
      {
        erro: "Erro ao enviar alerta CFO",
        detalhe: error.message,
      },
      { status: 500 }
    );
  }
}
