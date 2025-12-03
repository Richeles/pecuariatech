<#
───────────────────────────────────────────────────────────────
🌾 PecuariaTech · Triângulo 360° Cloud AutoSetup v7.2.1
───────────────────────────────────────────────────────────────
- Detecta e instala Supabase CLI
- Corrige erro 404 de login automático
- Faz login via navegador (com código de verificação)
- Publica função cloud triangulo360-monitor
- Cria agendamento automático (1x por hora)
───────────────────────────────────────────────────────────────
Autor: Richeles Alves
#>

# ===== VARIÁVEIS =====
$PROJECT_REF = "<SEU_PROJECT_REF>"
$FUNC_NAME = "triangulo360-monitor"
$FUNC_DIR = "C:\Users\Administrador\pecuariatech\supabase\functions\$FUNC_NAME"
$FUNC_FILE = "$FUNC_DIR\index.ts"
$SCHEDULE = "0 * * * *"  # Executa a cada 1h
$SUPABASE_PATH = "C:\SupabaseCLI"

# ===== DETECÇÃO DO CLI =====
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Host "🧩 Supabase CLI não encontrado — iniciando instalação..." -ForegroundColor Yellow
    try {
        $release = Invoke-RestMethod "https://api.github.com/repos/supabase/cli/releases/latest"
        $asset = $release.assets | Where-Object { $_.name -match "windows" -and $_.name -match "zip|exe" } | Select-Object -First 1
        if ($asset) {
            $url = $asset.browser_download_url
            $zip = "$env:TEMP\supabase.zip"
            Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
            Expand-Archive -Path $zip -DestinationPath $SUPABASE_PATH -Force
            [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$SUPABASE_PATH", [EnvironmentVariableTarget]::Machine)
            Write-Host "✅ Supabase CLI instalado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "❌ Não foi possível encontrar o binário do Supabase CLI no GitHub." -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Falha ao instalar Supabase CLI: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Supabase CLI detectado." -ForegroundColor Green
}

# ===== VERIFICA LOGIN =====
$loginStatus = supabase projects list 2>&1
if ($loginStatus -match "not logged in" -or $loginStatus -match "Please log in") {
    Write-Host "`n🔐 Você ainda não está logado no Supabase CLI." -ForegroundColor Yellow
    Write-Host "Abrindo link correto de login..." -ForegroundColor Cyan
    Start-Process "https://supabase.com/dashboard/cli/login"
    Write-Host "`n👉 Acesse o site, faça login e copie o código de verificação exibido."
    $code = Read-Host "Cole aqui o código de verificação"
    try {
        supabase login --token $code
        Write-Host "✅ Login concluído com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Falha no login. Tente novamente mais tarde." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Supabase CLI já autenticado." -ForegroundColor Green
}

# ===== VERIFICA DIRETÓRIO =====
if (!(Test-Path $FUNC_DIR)) { New-Item -ItemType Directory -Path $FUNC_DIR -Force | Out-Null }

# ===== GERAR FUNÇÃO INDEX.TS =====
$code = @"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
  const TELEGRAM_CHAT = Deno.env.get("TELEGRAM_CHAT_ID")!;
  const WHATSAPP_WEBHOOK = Deno.env.get("WHATSAPP_WEBHOOK")!;

  const tables = ["pastagem","rebanho","financeiro","racas","dashboard"];
  const fails: string[] = [];
  for (const tb of tables) {
    try {
      const res = await fetch(\`\${SUPABASE_URL}/rest/v1/\${tb}?select=id&limit=1\`, {
        headers: { apikey: SUPABASE_KEY, Authorization: \`Bearer \${SUPABASE_KEY}\` },
      });
      if (!res.ok) fails.push(tb);
    } catch { fails.push(tb); }
  }

  const stability = Math.round(((tables.length - fails.length) / tables.length) * 100);
  const msg = \`🚨 Triângulo 360° — Estabilidade: \${stability}% Falhas: \${fails.join(", ")}\`;

  await fetch(\`\${SUPABASE_URL}/rest/v1/triangulo_logs\`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: \`Bearer \${SUPABASE_KEY}\`, "Content-Type": "application/json" },
    body: JSON.stringify({ estabilidade: stability, falhas: fails, timestamp: new Date().toISOString() }),
  });

  if (stability < 70) {
    await fetch(\`https://api.telegram.org/bot\${TELEGRAM_TOKEN}/sendMessage\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT, text: msg }),
    });
    if (WHATSAPP_WEBHOOK) {
      await fetch(WHATSAPP_WEBHOOK, { method: "POST", body: JSON.stringify({ message: msg }) });
    }
  }

  return new Response(JSON.stringify({ status: "ok", estabilidade: stability }), {
    headers: { "Content-Type": "application/json" },
  });
});
"@
Set-Content -Path $FUNC_FILE -Value $code -Encoding UTF8
Write-Host "✅ Função cloud '$FUNC_NAME' criada em $FUNC_FILE" -ForegroundColor Green

# ===== DEPLOY AUTOMÁTICO =====
Write-Host "`n🚀 Publicando função no Supabase..." -ForegroundColor Cyan
supabase functions deploy $FUNC_NAME --project-ref $PROJECT_REF

# ===== AGENDA EXECUÇÃO =====
Write-Host "`n🕓 Criando agendamento automático..." -ForegroundColor Cyan
supabase functions schedule create "Triangulo360Monitor" `
  --function $FUNC_NAME `
  --project-ref $PROJECT_REF `
  --cron $SCHEDULE

Write-Host "`n✅ Configuração completa!" -ForegroundColor Green
Write-Host "Função: $FUNC_NAME"
Write-Host "Agendamento: $SCHEDULE"
Write-Host "Logs: tabela triangulo_logs"
Write-Host "Alerta: Telegram + WhatsApp"
