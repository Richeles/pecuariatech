# TesteFinal360-CORRIGIDO.ps1
# Teste completo do deploy PecuariaTech 360º (domínio + página + webhook)

# ==============================
# CONFIGURAÇÕES
# ==============================
$dominio = "www.pecuariatech.com"

# Texto de verificação confiável no HTML da página
$verificacao_html = "🌾 PecuariaTech - Triângulo 360º"

$telegram_test_chat_id = "COLOQUE_SEU_CHAT_ID_AQUI"
$telegram_bot_token = "COLOQUE_SEU_BOT_TOKEN_AQUI"

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
    try {
        $body = @{ message = @{ text = "D"; chat = @{ id = $telegram_test_chat_id } } } | ConvertTo-Json
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
if ($dominioStatus.Success) {
    if ($dominioStatus.Content -match [regex]::Escape($verificacao_html)) {
        Write-Host "🎯 Página carregou a versão Triângulo 360º!"
        $paginaOk = $true
    } else {
        Write-Host "⚠️ Página não contém o texto de verificação."
        $paginaOk = $false
    }
}

# ==============================
# 3️⃣ Testar webhook Telegram
# ==============================
Write-Host "📩 Testando webhook Telegram..."
$webhookResp = Test-TelegramWebhook
Write-Host "Resposta do webhook: $webhookResp"

# ==============================
# 4️⃣ Relatório final
# ==============================
Write-Host "=============================="
Write-Host "✅ Teste Final 360º Corrigido Concluído"
Write-Host "Domínio online: $($dominioStatus.Success)"
Write-Host "Versão Triângulo 360º carregada: $paginaOk"
Write-Host "Webhook Telegram: $webhookResp"
Write-Host "=============================="
