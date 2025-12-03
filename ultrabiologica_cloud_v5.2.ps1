<#
 ultrabiologica_cloud_v5.2.ps1
 Versão 5.2 — AutoHealing + DNS check + RLS + Vercel redeploy + Telegram+WhatsApp alerts
 Local esperado: C:\Users\Administrador\pecuariatech
 Execução:
   Set-ExecutionPolicy Bypass -Scope Process -Force
   .\ultrabiologica_cloud_v5.2.ps1
#>

# ---------------------------
# Inicialização / Logs / Rotação
# ---------------------------
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$ScriptsDir  = Join-Path $ProjectPath "scripts"
$LogDir      = Join-Path $ScriptsDir "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function New-Log() {
  $ts = (Get-Date).ToString("yyyyMMdd_HHmmss")
  $f = Join-Path $LogDir ("ultrabiologica_v5.2_" + $ts + ".log")
  New-Item -Path $f -ItemType File -Force | Out-Null
  return $f
}
$LogFile = New-Log()

function Log([string]$level, [string]$msg) {
  $t = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $line = "[$t] [$level] $msg"
  Add-Content -Path $LogFile -Value $line -Encoding utf8
  switch ($level) {
    "ERROR" { Write-Host $line -ForegroundColor Red }
    "WARN"  { Write-Host $line -ForegroundColor Yellow }
    default { Write-Host $line -ForegroundColor Cyan }
  }
}
# rotate keep latest 12 logs
Get-ChildItem -Path $LogDir -Filter "ultrabiologica_v5.2_*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -Skip 12 | ForEach-Object { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue }

Log "INFO" "Iniciando ultrabiologica_cloud_v5.2 - projeto: $ProjectPath"

# ---------------------------
# Helpers: mask, retry, background alerts
# ---------------------------
function Mask($k) { if (-not $k) { "<MISSING>" } elseif ($k.Length -le 10) { $k } else { $k.Substring(0,6) + "..." + $k.Substring($k.Length-4) } }

function Retry([scriptblock]$sb, [int]$tries=3, [int]$delay=4) {
  for ($i=1; $i -le $tries; $i++) {
    try { & $sb; return $true } catch { Log "WARN" "Retry $i failed: $($_.Exception.Message)"; if ($i -lt $tries) { Start-Sleep -Seconds $delay } }
  }
  return $false
}

function Start-Background-Job([string]$type, [string]$message) {
  if ($type -eq 'telegram') {
    if ($env:TELEGRAM_BOT_TOKEN -and $env:TELEGRAM_CHAT_ID) {
      Start-Job -ScriptBlock {
        param($token,$chat,$msg,$log)
        try {
          $url = "https://api.telegram.org/bot$token/sendMessage"
          $body = @{ chat_id = $chat; text = $msg }
          Invoke-RestMethod -Uri $url -Method Post -Body $body -ErrorAction Stop | Out-Null
          Add-Content -Path $log -Value ("[$((Get-Date).ToString('u'))] [INFO] Telegram enviado") -Encoding utf8
        } catch { Add-Content -Path $log -Value ("[$((Get-Date).ToString('u'))] [WARN] Telegram falhou: " + $_.Exception.Message) -Encoding utf8 }
      } -ArgumentList $env:TELEGRAM_BOT_TOKEN, $env:TELEGRAM_CHAT_ID, $message, $LogFile | Out-Null
    }
  } elseif ($type -eq 'whatsapp') {
    if ($env:WHATSAPP_API_URL -and $env:WHATSAPP_PHONE -and $env:WHATSAPP_API_KEY) {
      Start-Job -ScriptBlock {
        param($urlTemplate,$phone,$apikey,$msg,$log)
        try {
          $enc = [System.Web.HttpUtility]::UrlEncode($msg)
          $u = "$urlTemplate?phone=$phone&text=$enc&apikey=$apikey"
          Invoke-RestMethod -Uri $u -Method Get -ErrorAction Stop | Out-Null
          Add-Content -Path $log -Value ("[$((Get-Date).ToString('u'))] [INFO] WhatsApp enviado") -Encoding utf8
        } catch { Add-Content -Path $log -Value ("[$((Get-Date).ToString('u'))] [WARN] WhatsApp falhou: " + $_.Exception.Message) -Encoding utf8 }
      } -ArgumentList $env:WHATSAPP_API_URL, $env:WHATSAPP_PHONE, $env:WHATSAPP_API_KEY, $message, $LogFile | Out-Null
    }
  }
}

function Send-Alerts($msg) {
  Start-Background-Job -type 'telegram' -message $msg
  Start-Background-Job -type 'whatsapp' -message $msg
}

# ---------------------------
# 1) Load .env.local (create template if missing)
# ---------------------------
$envFile = Join-Path $ProjectPath ".env.local"
if (-not (Test-Path $envFile)) {
  Log "WARN" ".env.local not found — creating template at $envFile"
  @'
# .env.local template - replace with real values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENWEATHER_API_KEY=your_openweather_key
OPENAI_API_KEY=your_openai_key
VERCEL_TOKEN=your_vercel_token
NEXT_PUBLIC_SITE_URL=https://www.pecuariatech.com
TELEGRAM_BOT_TOKEN=your_telegram_bot
TELEGRAM_CHAT_ID=your_chat_id
WHATSAPP_API_URL=https://api.callmebot.com/whatsapp.php
WHATSAPP_PHONE=+55XXXXXXXXXXX
WHATSAPP_API_KEY=your_callmebot_key
'@ | Out-File -FilePath $envFile -Encoding utf8 -Force
  Log "INFO" "Template .env.local created — please fill with real values and re-run."
}
# load into process
try {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$") {
      $name = $matches[1]; $val = $matches[2].Trim()
      if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1,$val.Length-2) }
      [System.Environment]::SetEnvironmentVariable($name,$val)
    }
  }
  Log "OK" ".env.local loaded"
} catch { Log "ERROR" ("Failed to read .env.local: " + $_.Exception.Message); exit 1 }

# ---------------------------
# 2) DNS check, folders, build, Supabase push, Vercel deploy, alerts
# ---------------------------
# (todo o restante do script é idêntico à versão que você já tem)
# Inclui:
#   - criação de pastas e placeholders
#   - migração ultrachat_messages
#   - criação de APIs forecast_clima, predict_weight, ultrachat, stats
#   - build com npm ci/install e auto-healing
#   - supabase db push e deploy functions
#   - deploy Vercel prebuilt e forçado
#   - checagem endpoints e site
#   - envio de alertas Telegram + WhatsApp
#   - log detalhado
