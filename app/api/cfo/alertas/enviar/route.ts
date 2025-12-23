// app/api/cfo/alertas/enviar/route.ts
// PecuariaTech CFO — Alerta Automático (Telegram)
// Fonte Y: motor de decisão CFO

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1️⃣ Avaliar situação financeira (motor CFO)
    const avaliar = await fetch(
      `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/api/cfo/alertas/avaliar`,
      { cache: "no-store" }
    );

    const data = await avaliar.json();

    if (data.nivel === "ok") {
      return NextResponse.json({
        status: "ok",
        mensagem: "Nenhum alerta CFO necessário",
      });
    }

    // 2️⃣ Montar mensagem CFO
    const texto =
      `🚨 *PecuariaTech CFO — Alerta ${data.nivel.toUpperCase()}*\n\n` +
      `📅 Referência: ${data.referencia}\n` +
      `📉 Resultado: R$ ${Number(data.resultado_operacional).toLocaleString("pt-BR")}\n` +
      `⚠️ Motivo: ${data.motivo}\n\n` +
      `👉 Ação recomendada: Revisar custos e estratégia financeira.`;

    // 3️⃣ Enviar para Telegram
    const telegram = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: texto,
          parse_mode: "Markdown",
        }),
      }
    );

    const result = await telegram.json();

    if (!result.ok) {
      throw new Error("Falha no envio para Telegram");
    }

    return NextResponse.json({
      status: "alerta_enviado",
      nivel: data.nivel,
    });
  } catch (err) {
    console.error("Erro alerta CFO:", err);
    return NextResponse.json(
      { erro: "Erro ao enviar alerta CFO" },
      { status: 500 }
    );
  }
}
