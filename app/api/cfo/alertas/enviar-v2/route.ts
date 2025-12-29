// app/api/cfo/alertas/enviar-v2/route.ts
// PecuariaTech CFO — Automação de Alertas (Telegram)
// Action-only | Runtime-only | Equação Y preservada

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// POST /api/cfo/alertas/enviar-v2
// ===============================
export async function POST() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (
      !supabaseUrl ||
      !serviceKey ||
      !telegramToken ||
      !telegramChatId
    ) {
      console.error("ENV alertas/enviar-v2 incompleto");
      return NextResponse.json(
        { erro: "Configuração de automação ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1️⃣ Buscar alertas pendentes
    const { data: alertas, error } = await supabase
      .from("cfo_alertas")
      .select("*")
      .eq("status", "gerado")
      .order("created_at", { ascending: true });

    if (error || !alertas || alertas.length === 0) {
      return NextResponse.json({
        status: "ok",
        mensagem: "Nenhum alerta pendente",
      });
    }

    // 2️⃣ Enviar um a um (controle fino)
    for (const alerta of alertas) {
      const texto = `
🚨 *Alerta CFO PecuariaTech*

Tipo: ${alerta.tipo.toUpperCase()}
Prioridade: ${alerta.prioridade.toUpperCase()}

${alerta.mensagem}

Mês: ${alerta.mes_referencia}
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

      if (!res.ok) {
        console.error("Falha envio Telegram:", await res.text());
        continue;
      }

      // 3️⃣ Marcar como enviado
      await supabase
        .from("cfo_alertas")
        .update({
          status: "enviado",
          enviado_em: new Date().toISOString(),
          canal: "telegram",
        })
        .eq("id", alerta.id);
    }

    return NextResponse.json({
      status: "ok",
      enviados: alertas.length,
    });
  } catch (err) {
    console.error("Erro alertas/enviar-v2:", err);
    return NextResponse.json(
      { erro: "Erro interno na automação de alertas" },
      { status: 500 }
    );
  }
}
