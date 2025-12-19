// app/api/telegram/webhook/route.ts
// Next.js 16 + TypeScript strict
// Webhook oficial Telegram – PecuariaTech

import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_API = "https://api.telegram.org";

type TelegramMessage = {
  message?: {
    chat: { id: number };
    text?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      console.error("TELEGRAM_BOT_TOKEN não configurado");
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const body = (await req.json()) as TelegramMessage;
    const chatId = body.message?.chat.id;
    const text = body.message?.text?.trim();

    if (!chatId || !text) {
      return NextResponse.json({ ok: true });
    }

    let resposta = "";

    switch (text) {
      case "/start":
        resposta =
          "🐂 *Bem-vindo à PecuariaTech!*\n\n" +
          "Aqui você receberá alertas biológicos, status do rebanho e suporte inteligente.\n\n" +
          "Use /status para verificar o sistema.";
        break;

      case "/status":
        resposta =
          "📊 *Status do Sistema PecuariaTech*\n\n" +
          "✅ Plataforma: Online\n" +
          "✅ Dashboard: Ativo\n" +
          "✅ Monitoramento biológico: Operacional";
        break;

      default:
        resposta =
          "Comando não reconhecido.\n\n" +
          "Comandos disponíveis:\n" +
          "/start\n" +
          "/status";
    }

    await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: resposta,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro Telegram Webhook:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
