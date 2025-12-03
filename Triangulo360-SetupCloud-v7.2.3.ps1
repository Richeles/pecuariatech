<#
───────────────────────────────────────────────────────────────
 🌾 PecuariaTech CloudOps 360° v7.2.3 — Supabase + PowerShell
───────────────────────────────────────────────────────────────
⚙️  Deploy + Agendamento + Status ASCII
───────────────────────────────────────────────────────────────
#>

$PROJECT_REF = "kpzzekflqpoeccnqfkng"
$FUNC_NAME = "triangulo360-monitor"
$FUNC_DIR = "C:\Users\Administrador\pecuariatech\supabase\functions\$FUNC_NAME"
$FUNC_FILE = "$FUNC_DIR\index.ts"
$ENV_FILE  = "C:\Users\Administrador\pecuariatech\supabase\.env"
$SCHEDULE  = "0 * * * *"

$SUPABASE_URL  = $env:NEXT_PUBLIC_SUPABASE_URL
$SUPABASE_KEY  = $env:SUPABASE_SERVICE_ROLE_KEY
$TELEGRAM_TOKEN = "<SEU_TOKEN_BOT>"
$TELEGRAM_CHAT  = "<SEU_CHAT_ID>"
$WHATSAPP_WEBHOOK = "<URL_DO_WEBHOOK_WHATSAPP>"

Write-Host "`n🚀 Iniciando Triângulo 360° CloudOps v7.2.3..." -ForegroundColor Cyan
if (!(Test-Path $FUNC_DIR)) { New-Item -ItemType Directory -Path $FUNC_DIR -Force | Out-Null }

# ===== GERAR FUNÇÃO CLOUD =====
$code = @"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
  const TELEGRAM_CHAT = Deno.env.get("TELEGRAM_CHAT_ID")!;
  const WHATSAPP_WEBHOOK = Deno.env.get("WHATSAPP_WEBHOOK")!;

  const tables = ["pastagem","rebanho","financeiro","racas","dashboard"];
  const falhas = [];

  for (const tb of tables) {
    try {
      const res = await fetch(\`\${SUPABASE_URL}/rest/v1/\${tb}?select=id&limit=1\`, {
        headers: { apikey: SUPABASE_KEY, Authorization: \`Bearer \${SUPABASE_KEY}\` },
      });
      if (!res.ok) falhas.push(tb);
    } catch { falhas.push(tb); }
  }

  const estabilidade = Math.round(((tables.length - falhas.length) / tables.length) * 100);
  const msg = \`🚨 Triângulo 360° — Estabilidade: \${estabilidade}% Falhas: \${falhas.join(", ")}\`;

  await fetch(\`\${SUPABASE_URL}/rest/v1/triangulo_logs\`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: \`Bearer \${SUPABASE_KEY}\`, "Content-Type": "application/json" },
    body: JSON.stringify({ estabilidade, falhas, timestamp: new Date().toISOString() }),
  });

  if (estabilidade < 70) {
    await fetch(\`https://api.telegram.org/bot\${TELEGRAM_TOKEN}/sendMessage\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT, text: msg }),
    });
    if (WHATSAPP_WEBHOOK) {
      await fetch(WHATSAPP_WEBHOOK, { method: "POST", body: JSON.stringify({ message: msg }) });
    }
  }

  return new Response(JSON.stringify({ status: "ok", estabilidade }), {
    headers: { "Content-Type": "application/json" },
  });
});
"@
Set-Content -Path $FUNC_FILE -Value $code -Encoding UTF8
Write-Host "✅ Função '$FUNC_NAME' criada localmente!" -ForegroundColor Green

# ===== GERAR ENV =====
@"
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_KEY
TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN
TELEGRAM_CHAT_ID=$TELEGRAM_CHAT
WHATSAPP_WEBHOOK=$WHATSAPP_WEBHOOK
"@ | Set-Content -Path $ENV_FILE -Encoding UTF8
Write-Host "✅ Arquivo .env configurado."

# ===== DEPLOY FUNCTION =====
Write-Host "`n🚀 Publicando função no Supabase..." -ForegroundColor Cyan
cd "C:\Users\Administrador\pecuariatech\supabase"
supabase functions deploy $FUNC_NAME

# ===== AGENDAR EXECUÇÃO (CLI NOVO) =====
Write-Host "`n🕓 Criando agendamento automático (CLI 2.x)..." -ForegroundColor Cyan
supabase cron schedule create $FUNC_NAME --cron $SCHEDULE

# ===== INVOCAR E EXIBIR STATUS =====
Write-Host "`n📊 Triângulo 360° Status Atual:" -ForegroundColor Yellow
try {
    $resp = supabase functions invoke $FUNC_NAME
    Write-Host "──────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host $resp
    Write-Host "──────────────────────────────────────────────" -ForegroundColor DarkGray

    $json = $resp | ConvertFrom-Json
    $bar = ("█" * ($json.estabilidade / 10)) + ("░" * (10 - ($json.estabilidade / 10)))
    $cor = if ($json.estabilidade -ge 80) { "Green" } elseif ($json.estabilidade -ge 50) { "Yellow" } else { "Red" }

    Write-Host "`n📈 Estabilidade Geral: " -NoNewline
    Write-Host "$($json.estabilidade)% $bar" -ForegroundColor $cor
}
catch {
    Write-Host "⚠️ Não foi possível obter resposta da função." -ForegroundColor Red
}

# ===== FINAL =====
Write-Host "`n✅ CloudOps configurado com sucesso!" -ForegroundColor Green
Write-Host "🌐 Função ativa: $FUNC_NAME"
Write-Host "🕓 Execução automática: $SCHEDULE"
Write-Host "📜 Logs: triangulo_logs"
Write-Host "📲 Alertas: Telegram + WhatsApp"
