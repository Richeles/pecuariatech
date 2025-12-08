'use client';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  const SUPABASE_URL = env.get("SUPABASE_URL")!;
  const SUPABASE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TELEGRAM_TOKEN = env.get("TELEGRAM_BOT_TOKEN")!;
  const TELEGRAM_CHAT = env.get("TELEGRAM_CHAT_ID")!;
  const WHATSAPP_WEBHOOK = env.get("WHATSAPP_WEBHOOK")!;

  const tables = ["pastagem","rebanho","financeiro","racas","dashboard"];
  const falhas = [];

  for (const tb of tables) {
    try {
      const res = await fetch(\\https://kpzzekflqpoeccnqfkng.supabase.co/rest/v1/\?select=id&limit=1\, {
        headers: { apikey: SUPABASE_KEY, Authorization: \Bearer \eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA\ },
      });
      if (!res.ok) falhas.push(tb);
    } catch { falhas.push(tb); }
  }

  const estabilidade = Math.round(((tables.length - falhas.length) / tables.length) * 100);
  const msg = \🚨 Triângulo 360° — Estabilidade: \% Falhas: \\;

  await fetch(\\https://kpzzekflqpoeccnqfkng.supabase.co/rest/v1/triangulo_logs\, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: \Bearer \eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA\, "Content-Type": "application/json" },
    body: JSON.stringify({ estabilidade, falhas, timestamp: new Date().toISOString() }),
  });

  if (estabilidade < 70) {
    await fetch(\https://api.telegram.org/bot\<SEU_TOKEN_BOT>/sendMessage\, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT, text: msg }),
    });
    if (WHATSAPP_WEBHOOK) {
      await fetch(WHATSAPP_WEBHOOK, { method: "POST", body: JSON.stringify({ message: msg }) });
    }
  }

  return new Response(JSON.stringify({ status: "ok", estabilidade, falhas }), {
    headers: { "Content-Type": "application/json" },
  });
});





