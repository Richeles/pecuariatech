// app/api/telegram/webhook/route.ts
// Next.js 16 + TypeScript strict
// Webhook oficial Telegram – PecuariaTech
// Runtime-only | Equação Y aplicada

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const TELEGRAM_API = "https://api.telegram.org";

type TelegramPayload = {
  message?: {
    chat: { id: number };
    text?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!telegramToken) {
      console.error("TELEGRAM_BOT_TOKEN não configurado");
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const body = (await req.json()) as TelegramPayload;
    const chatId = body.message?.chat.id;
    const text = body.message?.text?.trim();

    if (!chatId || !text) {
      return NextResponse.json({ ok: true });
    }

    // ===============================
    // Supabase (SERVER ONLY)
    // ===============================
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ===============================
    // /start <token>  → vínculo seguro
    // ===============================
    if (text.startsWith("/start ")) {
      const token = text.split(" ")[1];

      const { data: tokenData } = await supabase
        .from("telegram_tokens")
        .select("*")
        .eq("token", token)
        .eq("usado", false)
        .single();

      if (tokenData) {
        // Vincular usuário ↔ chat_id
        await supabase.from("telegram_usuarios").upsert({
          user_id: tokenData.user_id,
          chat_id: chatId,
          ativo: true,
        });

        // Invalidar token (anti-replay)
        await supabase
          .from("telegram_tokens")
          .update({ usado: true })
          .eq("id", tokenData.id);

        await enviarMensagem(
          telegramToken,
          chatId,
          "✅ *Alertas ativados com sucesso!*\n\nA partir de agora você receberá notificações inteligentes da PecuariaTech."
        );

        return NextResponse.json({ ok: true });
      }
    }

    // ===============================
    // Comandos padrão
    // ===============================
    let resposta = "";

    switch (text) {
      case "/start":
        resposta =
          "🐂 *Bem-vindo à PecuariaTech!*\n\n" +
          "Você receberá alertas biológicos, financeiros e estratégicos.\n\n" +
          "Use /status para verificar o sistema.";
        break;

      case "/status":
        resposta =
          "📊 *Status do Sistema PecuariaTech*\n\n" +
          "✅ Plataforma: Online\n" +
          "✅ Monitoramento biológico: Ativo\n" +
          "✅ Alertas inteligentes: Operacionais";
        break;

      default:
        resposta =
          "❓ *Comando não reconhecido*\n\n" +
          "Comandos disponíveis:\n" +
          "/start\n" +
          "/status";
    }

    await enviarMensagem(telegramToken, chatId, resposta);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro Telegram Webhook:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// ===============================
// Função interna de envio
// ===============================
async function enviarMensagem(
  token: string,
  chatId: number,
  texto: string
) {
  await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: texto,
      parse_mode: "Markdown",
    }),
  });
}
