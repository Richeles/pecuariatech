# Script: pecuariatech-evolve-bio.ps1
# Objetivo: Build, deploy no Vercel, domínio + SSL, alertas Telegram/WhatsApp e log local

param(
    [string]$Domain = "pecuariatech.com",
    [string]$Project = "pecuariatech",
    [string]$TelegramToken = $env:TELEGRAM_BOT_TOKEN,
    [string]$TelegramChatId = $env:TELEGRAM_CHAT_ID,
    [string]$WhatsAppNumber = $env:WHATSAPP_NUMBER, # Exemplo: 5567999999999
    [string]$WhatsAppApiKey = $env:WHATSAPP_API_KEY
)

# Criar pasta de logs se não existir
$logDir = "C:\Users\Administrador\pecuariatech\logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$logFile = Join-Path $logDir "pecuariatech.log"

# Função para logar no console + arquivo
function Log {
    param([string]$msg, [string]$color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $msg"
    Write-Host $line -ForegroundColor $color
    Add-Content -Path $logFile -Value $line
}

function Send-Telegram {
    param([string]$msg)
    if ($TelegramToken -and $TelegramChatId) {
        try {
            Invoke-RestMethod -Uri "https://api.telegram.org/bot$TelegramToken/sendMessage" `
                -Method POST -ContentType "application/json" `
                -Body (@{chat_id=$TelegramChatId;text=$msg} | ConvertTo-Json -Compress)
            Log "📢 Alerta enviado para Telegram." "Green"
        } catch {
            Log "⚠️ Falha ao enviar alerta Telegram." "Red"
        }
    }
}

function Send-WhatsApp {
    param([string]$msg)
    if ($WhatsAppNumber -and $WhatsAppApiKey) {
        try {
            $encoded = [System.Web.HttpUtility]::UrlEncode($msg)
            $url = "https://api.callmebot.com/whatsapp.php?phone=$WhatsAppNumber&text=$encoded&apikey=$WhatsAppApiKey"
            Invoke-RestMethod -Uri $url -Method GET | Out-Null
            Log "📢 Alerta enviado para WhatsApp." "Green"
        } catch {
            Log "⚠️ Falha ao enviar alerta WhatsApp." "Red"
        }
    }
}

function Test-DNS {
    param([string]$d)
    try {
        $records = (Resolve-DnsName $d -Type CNAME -ErrorAction Stop).NameHost
        return $records -like "*vercel-dns.com"
    } catch {
        return $false
    }
}

# ===== EXECUÇÃO PRINCIPAL =====

Log "🔄 Evolução automática do PecuariaTech iniciada..." "Cyan"

# 1. Atualizar dependências
Log "📦 Atualizando dependências..."
npm install --force | Out-Null

# 2. Build local
Log "🏗 Rodando build local..."
npm run build

# 3. Deploy no Vercel
Log "🚀 Fazendo deploy no Vercel..."
$deployOut = vercel --prod --yes
Add-Content -Path $logFile -Value $deployOut

# 4. Configurar domínio
Log "🌐 Configurando domínio $Domain..."
vercel domains add $Domain --yes | Out-Null
vercel domains add "www.$Domain" --yes | Out-Null
vercel alias set $Project "www.$Domain" --yes | Out-Null

# 5. Verificar DNS
Log "🔍 Checando DNS para www.$Domain..."
$dnsOk = $false
for ($i=0; $i -lt 20; $i++) {
    if (Test-DNS "www.$Domain") {
        Log "✅ DNS OK, apontando para Vercel." "Green"
        $dnsOk = $true
        break
    } else {
        Log "⏳ Aguardando propagação DNS ($($i+1)/20)..." "Yellow"
        Start-Sleep -Seconds 30
    }
}

if (-not $dnsOk) {
    $msg = "❌ PecuariaTech: DNS não propagou para www.$Domain"
    Log $msg "Red"
    Send-Telegram $msg
    Send-WhatsApp $msg
    exit 1
}

# 6. Monitorar SSL
Log "🔒 Monitorando SSL para https://www.$Domain ..."
for ($i=0; $i -lt 20; $i++) {
    try {
        $req = Invoke-WebRequest "https://www.$Domain" -UseBasicParsing -TimeoutSec 10
        if ($req.StatusCode -eq 200) {
            $msg = "🚀 PecuariaTech online com SSL ativo: https://www.$Domain"
            Log $msg "Green"
            Send-Telegram $msg
            Send-WhatsApp $msg
            exit 0
        }
    } catch {
        Log "⏳ SSL ainda não ativo ($($i+1)/20)..." "Yellow"
    }
    Start-Sleep -Seconds 30
}

$msg = "⚠️ SSL não ficou ativo no tempo esperado. Verifique no painel do Vercel."
Log $msg "Red"
Send-Telegram $msg
Send-WhatsApp $msg
exit 1
