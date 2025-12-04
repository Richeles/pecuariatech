# TesteFinal360-PRO-FULL.ps1
# Teste final definitivo do deploy PecuariaTech 360º
# ⚠️ Token e Chat ID já embutidos

# ==============================
# CONFIGURAÇÕES
# ==============================
$dominio = "www.pecuariatech.com"
$verificacao_html = "🌾 PecuariaTech - Triângulo 360º"

# Dados do Telegram (já configurados)
$telegram_bot_token = "8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg"
$telegram_test_chat_id = "5567999564560"

# ==============================
# Função para testar domínio e página
# ==============================
function Test-Dominio {
    param([string]$url)
    try {
        $response = Invoke-WebRequest -Uri "https://$url" -UseBasicParsing -TimeoutSec 15
        return @{ Success = $true; StatusCode = $response.StatusCode; Content = $response.Content }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# ==============================
# Função para testar webhook Telegram
# ==============================
function Test-TelegramWebhook {
    param($token, $chat_id)
    if (-not $token -or -not $chat_id) { return "Webhook não configurado" }
    try {
        $body = @{ message = @{ text = "D"; chat = @{ id = $chat_id } } } | ConvertTo-Json
        $url = "https://www.pecuariatech.com/api/ultrachat/webhook"
        $resp = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
        return $resp
    } catch {
        return "Erro no webhook: $($_.Exception.Message)"
    }
}

# ==============================
# 1️⃣ Checar domínio
# ==============================
Write-Host "🔎 Checando domínio $dominio..."
$dominioStatus = Test-Dominio $dominio
if ($dominioStatus.Success) {
    Write-Host "✅ Domínio responde! StatusCode: $($dominioStatus.StatusCode)"
} else {
    Write-Host "❌ Falha ao acessar domínio: $($dominioStatus.Error)"
}

# ==============================
# 2️⃣ Verificar versão Triângulo 360º
# ==============================
$paginaOk = $false
if ($dominioStatus.Success) {
    if ($dominioStatus.Content -match [regex]::Escape($verificacao_html)) {
        Write-Host "🎯 Página carregou a versão Triângulo 360º!"
        $paginaOk = $true
    } else {
        Write-Host "⚠️ Página não contém o texto de verificação."
    }
}

# ==============================
# 3️⃣ Testar webhook Telegram
# ==============================
Write-Host "📩 Testando webhook Telegram..."
$webhookResp = Test-TelegramWebhook -token $telegram_bot_token -chat_id $telegram_test_chat_id
Write-Host "Resposta do webhook: $webhookResp"

# ==============================
# 4️⃣ Relatório final
# ==============================
Write-Host "=============================="
Write-Host "✅ Teste Final 360º PRO-FULL Concluído"
Write-Host "Domínio online: $($dominioStatus.Success)"
Write-Host "Versão Triângulo 360º carregada: $paginaOk"
Write-Host "Webhook Telegram: $webhookResp"
Write-Host "=============================="
