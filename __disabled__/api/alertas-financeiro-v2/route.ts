// app/api/alertas/financeiro-v2/route.ts
// PecuariaTech — Financial Alert Engine
// Next.js 16 + TypeScript Strict + Enterprise Runtime
// Equação Y + Regra Z + Triângulo 360

import { NextResponse } from "next/server";

// ======================================
// RUNTIME
// ======================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================
// TYPES
// ======================================

type TelegramResponse = {
  ok: boolean;

  description?: string;

  result?: unknown;
};

// ======================================
// HANDLER
// ======================================

export async function GET() {
  try {
    // ======================================
    // ENVIRONMENT
    // ======================================

    const TELEGRAM_TOKEN =
      process.env.TELEGRAM_BOT_TOKEN;

    const TELEGRAM_CHAT_ID =
      process.env.TELEGRAM_CHAT_ID;

    if (
      !TELEGRAM_TOKEN ||
      !TELEGRAM_CHAT_ID
    ) {
      return NextResponse.json(
        {
          erro:
            "Variáveis TELEGRAM não configuradas",
        },
        {
          status: 500,
        }
      );
    }

    // ======================================
    // MOTOR FINANCEIRO
    // ======================================

    const resultadoOperacional =
      -1250;

    const riscoFinanceiro =
      resultadoOperacional < -1000
        ? "critico"
        : resultadoOperacional < 0
        ? "atencao"
        : "normal";

    // ======================================
    // SEM ALERTA
    // ======================================

    if (resultadoOperacional >= 0) {
      return NextResponse.json({
        status: "ok",

        risco: riscoFinanceiro,

        mensagem:
          "Nenhum alerta financeiro necessário",

        timestamp:
          new Date().toISOString(),
      });
    }

    // ======================================
    // MENSAGEM EXECUTIVA
    // ======================================

    const texto = `
🚨 *ALERTA FINANCEIRO — PecuariaTech*

Resultado operacional negativo detectado.

📉 Resultado:
R$ ${resultadoOperacional.toLocaleString(
      "pt-BR"
    )}

⚠️ Nível de risco:
${riscoFinanceiro.toUpperCase()}

👉 *Ação recomendada*
Revisar custos operacionais, sanitários e eficiência alimentar.
`;

    // ======================================
    // TELEGRAM API
    // ======================================

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          chat_id:
            TELEGRAM_CHAT_ID,

          text: texto,

          parse_mode:
            "Markdown",
        }),

        cache: "no-store",
      }
    );

    // ======================================
    // STRICT JSON TYPING
    // ======================================

    const telegramResult: TelegramResponse =
      await response.json();

    // ======================================
    // VALIDAR RESPOSTA
    // ======================================

    if (!telegramResult.ok) {
      return NextResponse.json(
        {
          erro:
            "Falha ao enviar alerta Telegram",

          detalhe:
            telegramResult.description ??
            "Erro desconhecido",
        },
        {
          status: 500,
        }
      );
    }

    // ======================================
    // SUCESSO
    // ======================================

    return NextResponse.json({
      status: "alerta_enviado",

      canal: "telegram",

      risco: riscoFinanceiro,

      timestamp:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Erro alerta financeiro:",
      error
    );

    return NextResponse.json(
      {
        erro:
          "Erro interno no alerta financeiro",
      },
      {
        status: 500,
      }
    );
  }
}