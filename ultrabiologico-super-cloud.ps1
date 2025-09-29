param(
    [string]$Domain = "pecuariatech.com",
    [string]$Project = "pecuariatech",
    [string]$WhatsAppToken = "<SEU_TOKEN_META>",
    [string]$PhoneNumberId = "<SEU_PHONE_NUMBER_ID>",
    [string]$ToWhatsApp = "5567999564560",
    [string]$TelegramBotToken = "<SEU_TOKEN_BOT>",
    [string]$TelegramChatId = "<SEU_CHAT_ID>"
)

# ---------- LOGGING ----------
$LogFile = "$PSScriptRoot\ultrabiologico-log.txt"
function Write-Stamp($Message) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logLine = "$timestamp $Message"
    Write-Host $logLine
    Add-Content -Path $LogFile -Value $logLine -Encoding UTF8
}

# ---------- BUILD & DEPLOY ----------
function Build-And-Deploy {
    Write-Stamp "🔧 Instalando dependências e rodando build..."
    npm install
    npm run build
    Write-Stamp "🚀 Deploy no Vercel..."
    vercel --prod --confirm
    Write-Stamp "✅ Deploy concluído."
}

# ---------- DOMÍNIO & SSL ----------
function Configure-Domain {
    Write-Stamp "🌐 Configurando domínio $Domain..."
    vercel domains add $Domain --yes
    vercel domains add "www.$Domain" --yes
    vercel alias set $Project "www.$Domain" --yes

    function Test-DNS { param([string]$d)
        try { $records = (Resolve-DnsName $d -Type CNAME -ErrorAction Stop).NameHost; return $records -like "*vercel-dns.com" } catch { return $false }
    }

    $dnsOk = $false
    for ($i=0; $i -lt 15; $i++) {
        if (Test-DNS "www.$Domain") {
            Write-Stamp "✅ DNS já aponta para Vercel."
            $dnsOk = $true
            break
        } else {
            Write-Stamp ("⏳ Aguardando propagação DNS... (tentativa {0}/15)" -f ($i+1))
            Start-Sleep -Seconds 60
        }
    }
    if (-not $dnsOk) { Write-Stamp "❌ DNS não propagou, verifique manualmente." }
}

# ---------- ALERTAS ----------
function Send-WhatsAppAlert($Message) {
    $Url = "https://graph.facebook.com/v17.0/$PhoneNumberId/messages"
    $Header = @{ "Authorization" = "Bearer $WhatsAppToken"; "Content-Type" = "application/json" }
    $Body = @{
        messaging_product = "whatsapp"
        to = $ToWhatsApp
        type = "text"
        text = @{ body = $Message }
    } | ConvertTo-Json -Depth 3
    try { Invoke-RestMethod -Method Post -Uri $Url -Headers $Header -Body $Body; Write-Stamp "✅ WhatsApp enviado." } 
    catch { Write-Stamp "❌ WhatsApp falhou: $_" }
}

function Send-TelegramAlert($Message) {
    $Url = "https://api.telegram.org/bot$TelegramBotToken/sendMessage"
    $Body = @{ chat_id = $TelegramChatId; text = $Message } | ConvertTo-Json
    try { Invoke-RestMethod -Method Post -Uri $Url -Body $Body -ContentType "application/json"; Write-Stamp "✅ Telegram enviado." } 
    catch { Write-Stamp "❌ Telegram falhou: $_" }
}

function Send-AllAlerts($Message) { Send-WhatsAppAlert $Message; Send-TelegramAlert $Message }

# ---------- MONITORAMENTO ONLINE ----------
function Check-Site {
    try { $req = Invoke-WebRequest "https://www.$Domain" -UseBasicParsing -TimeoutSec 10; if ($req.StatusCode -eq 200) { Write-Stamp "✅ Site online."; return $true } } 
    catch { Write-Stamp "⚠️ Site offline."; return $false }
}

# ---------- GPS INTEGRATION (PLACEHOLDER) ----------
function Start-GPSIntegration { Write-Stamp "📡 Iniciando integração GPS (placeholder)..." }

# ---------- IMAGE GENERATION (PLACEHOLDER) ----------
function Generate-ProjectImage { Write-Stamp "🖼 Gerando imagem do projeto (placeholder)..."; $imagePath="$PSScriptRoot\pecuariatech-highres.png"; Write-Stamp "✅ Imagem gerada em: $imagePath" }

# ---------- EXECUÇÃO PRINCIPAL ----------
Build-And-Deploy
Configure-Domain
Start-GPSIntegration
Generate-ProjectImage

# ---------- MONITORAMENTO CONTÍNUO EM BACKGROUND ----------
Write-Stamp "🔄 Monitoramento contínuo iniciado em background..."
$failCount = 0
$maxFails = 3

Start-Job -ScriptBlock {
    param($Domain, $maxFails, $failCount, $SendAlert)
    while ($true) {
        try {
            $siteOk = $false
            try { $req = Invoke-WebRequest "https://www.$Domain" -UseBasicParsing -TimeoutSec 10; if ($req.StatusCode -eq 200) { $siteOk = $true } } catch {}
            if (-not $siteOk) { 
                $failCount++
                if ($failCount -ge $maxFails) { & $SendAlert "🚨 Site PecuariaTech caiu $failCount vezes consecutivas!" } 
            } else { $failCount = 0 }
        } catch {}
        Start-Sleep -Seconds 60
    }
} -ArgumentList $Domain, $maxFails, $failCount, (Get-Command Send-AllAlerts)
