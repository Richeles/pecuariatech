param(
    [string]$Url = "https://pecuariatech.com",

    # 🔑 Substitua pelo token real do bot Telegram
    [string]$TelegramToken = "<SEU_TELEGRAM_BOT_TOKEN>",

    # 📩 Substitua pelo chat ID (ou deixe em branco para descobrir automaticamente)
    [string]$TelegramChatId = "",

    # 🔑 Substitua pelo token/API do WhatsApp se disponível
    [string]$WhatsAppToken = "<SEU_WHATSAPP_API_TOKEN>",

    # 📩 Substitua pelo número ou ID do destinatário WhatsApp
    [string]$WhatsAppRecipient = "<NUMERO_DESTINATARIO>"
)

# Caminho do log
$LogFile = Join-Path -Path $PSScriptRoot -ChildPath "ultrabiologico-log.txt"
if (-not (Test-Path $LogFile)) { New-Item -Path $LogFile -ItemType File -Force | Out-Null }

# Função de log
function Write-Log([string]$Message) {
    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = "$ts - $Message"
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
    Write-Host $line
}

# Descobre ChatId do Telegram automaticamente
function Get-ChatId {
    if ([string]::IsNullOrWhiteSpace($TelegramToken)) {
        Write-Log "⚠️ TelegramToken não configurado."
        return $null
    }
    try {
        $updates = Invoke-RestMethod -Uri "https://api.telegram.org/bot$TelegramToken/getUpdates" -ErrorAction Stop
        if ($updates.result.Count -gt 0 -and $updates.result[0].message.chat.id) {
            $chatId = $updates.result[0].message.chat.id
            Write-Log "📩 ChatId encontrado: $chatId"
            return $chatId
        } else {
            Write-Log "⚠️ Nenhuma mensagem encontrada. Envie uma mensagem para o bot e tente novamente."
            return $null
        }
    } catch {
        Write-Log ("❌ Erro ao buscar ChatId: {0}" -f $_.Exception.Message)
        return $null
    }
}

# Envia mensagem para Telegram
function Send-Telegram([string]$Message) {
    if ([string]::IsNullOrWhiteSpace($TelegramToken)) {
        Write-Log "⚠️ Telegram não configurado."
        return
    }
    if ([string]::IsNullOrWhiteSpace($TelegramChatId)) {
        $global:TelegramChatId = Get-ChatId
        if ([string]::IsNullOrWhiteSpace($global:TelegramChatId)) { return }
    }
    $Uri = "https://api.telegram.org/bot$TelegramToken/sendMessage"
    $Body = @{ chat_id = $global:TelegramChatId; text = $Message }
    try {
        Invoke-RestMethod -Uri $Uri -Method Post -Body $Body -ErrorAction Stop | Out-Null
        Write-Log "📨 Telegram enviado."
    } catch {
        Write-Log ("❌ Erro ao enviar Telegram: {0}" -f $_.Exception.Message)
    }
}

# Envia mensagem para WhatsApp
function Send-WhatsApp([string]$Message) {
    if ([string]::IsNullOrWhiteSpace($WhatsAppToken) -or [string]::IsNullOrWhiteSpace($WhatsAppRecipient)) {
        Write-Log "⚠️ WhatsApp não configurado. Preencha WhatsAppToken e WhatsAppRecipient."
        return
    }
    $Uri = "https://api.whatsapp.com/send?token=$WhatsAppToken&to=$WhatsAppRecipient&text=$([uri]::EscapeDataString($Message))"
    try {
        Invoke-RestMethod -Uri $Uri -Method Get -ErrorAction Stop | Out-Null
        Write-Log "📨 WhatsApp enviado."
    } catch {
        Write-Log ("❌ Erro ao enviar WhatsApp: {0}" -f $_.Exception.Message)
    }
}

# Função para enviar ambos
function Send-AllAlerts([string]$Message) {
    Send-Telegram $Message
    Send-WhatsApp $Message
}

# Intervalo entre verificações em segundos
$Intervalo = 300

# Loop principal de monitoramento
while ($true) {
    Write-Log "🚀 Iniciando verificação de $Url"
    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $msg = "✅ Site online: $Url"
            Write-Log $msg
            Send-AllAlerts $msg
        } else {
            $msg = "⚠️ Site retornou status $($resp.StatusCode) - $Url"
            Write-Log $msg
            Send-AllAlerts $msg
        }
    } catch {
        $err = $_.Exception.Message
        $msg = "❌ Falha ao acessar $Url - Erro: $err"
        Write-Log $msg
        Send-AllAlerts $msg
    }
    Write-Log "⏳ Aguardando $Intervalo segundos antes da próxima verificação..."
    Start-Sleep -Seconds $Intervalo
}
