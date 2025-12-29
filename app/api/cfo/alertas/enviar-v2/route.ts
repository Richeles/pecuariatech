// PecuariaTech CFO — Automação de Alertas (Telegram)
// Action-only | Runtime-only | Equação Y preservada

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (!supabaseUrl || !serviceKey || !telegramToken || !telegramChatId) {
      return NextResponse.json(
        { erro: "Configuração ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: alertas } = await supabase
      .from("cfo_alertas")
      .select("*")
      .eq("status", "gerado");

    if (!alertas || alertas.length === 0) {
      return NextResponse.json({ status: "ok", mensagem: "Nada a enviar" });
    }

    for (const alerta of alertas) {
      const texto = `🚨 *Alerta CFO PecuariaTech*

Tipo: ${alerta.tipo}
Prioridade: ${alerta.prioridade}

${alerta.mensagem}
`;

      const res = await fetch(
        `https://api.telegram.org/bot${telegramToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: texto,
            parse_mode: "Markdown",
          }),
        }
      );

      if (res.ok) {
        await supabase
          .from("cfo_alertas")
          .update({ status: "enviado" })
          .eq("id", alerta.id);
      }
    }

    return NextResponse.json({ status: "ok", enviados: alertas.length });
  } catch (err) {
    console.error("Erro enviar-v2:", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
