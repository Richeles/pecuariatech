# UltraDeploy360-PRO.ps1
# Deploy completo do PecuariaTech com logs e alerta Telegram

# ==============================
# CONFIGURAÇÕES
# ==============================
$dominio = "www.pecuariatech.com"
$github_branch = "main"
$vercel_project = "pecuariatech"
$vercel_token = "COLOQUE_SEU_TOKEN_VERCEL_AQUI" # Token Vercel
$telegram_bot_token = "COLOQUE_SEU_BOT_TOKEN_AQUI"
$telegram_chat_id = "COLOQUE_SEU_CHAT_ID_AQUI"
$max_retries = 5
$wait_seconds = 10
$log_file = ".\UltraDeploy360_PRO_log.txt"

# ==============================
# Função para registrar log
# ==============================
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$timestamp] $message"
    Write-Host $entry
    Add-Content -Path $log_file -Value $entry
}

# ==============================
# Função para checar domínio
# ==============================
function Test-Dominio {
    param([string]$url)
    try {
        $response = Invoke-WebRequest -Uri "https://$url" -UseBasicParsing -TimeoutSec 10
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# ==============================
# 1️⃣ Checar domínio
# ==============================
$retries = 0
while ($retries -lt $max_retries) {
    Write-Log "🔎 Checando domínio $dominio (tentativa $($retries+1)/$max_retries)..."
    if (Test-Dominio $dominio) {
        Write-Log "✅ Domínio está respondendo."
        break
    } else {
        Write-Log "⚠ Domínio não respondeu. Aguardando $wait_seconds segundos..."
        Start-Sleep -Seconds $wait_seconds
        $retries++
    }
}
if ($retries -eq $max_retries) {
    Write-Log "❌ Domínio $dominio não está respondendo. Abortando deploy."
    exit 1
}

# ==============================
# 2️⃣ Limpar build antigo e node_modules
# ==============================
Write-Log "🧹 Limpando .next e node_modules..."
Remove-Item -Recurse -Force .next,node_modules -ErrorAction SilentlyContinue

# ==============================
# 3️⃣ Remover lockfiles conflitantes
# ==============================
$lockfiles = @("C:\Users\Administrador\package-lock.json", ".\package-lock.json")
foreach ($lock in $lockfiles) {
    if (Test-Path $lock) {
        Write-Log "🗑️ Removendo lockfile: $lock"
        Remove-Item $lock -Force
    }
}

# ==============================
# 4️⃣ Instalar dependências
# ==============================
Write-Log "📦 Instalando dependências..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Log "❌ Falha ao instalar dependências. Abortando."
    exit 1
}

# ==============================
# 5️⃣ Rodar build
# ==============================
Write-Log "🏗️ Rodando build Next.js..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Log "❌ Build falhou. Abortando deploy."
    exit 1
}

# ==============================
# 6️⃣ Commit e push GitHub
# ==============================
Write-Log "🔀 Commitando alterações..."
git add .
git commit -m "UltraDeploy360-PRO: Build e atualização Triângulo 360º" -ErrorAction SilentlyContinue
git push origin $github_branch

# ==============================
# 7️⃣ Redeploy no Vercel
# ==============================
Write-Log "🚀 Forçando redeploy no Vercel..."
$headers = @{ "Authorization" = "Bearer $vercel_token" }
$body = @{ "name" = $vercel_project } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Method POST -Headers $headers -Body $body

Write-Log "⏳ Aguardando propagação do site..."
Start-Sleep -Seconds 15

# ==============================
# 8️⃣ Verificar site atualizado
# ==============================
if (Test-Dominio $dominio) {
    Write-Log "🎉 Site $dominio está online e atualizado com Triângulo 360º!"
    $message = "🚀 Deploy concluído! Site $dominio atualizado com sucesso."
} else {
    Write-Log "⚠️ Site $dominio ainda não respondeu. Verifique no painel Vercel."
    $message = "⚠️ Deploy concluído, mas site $dominio não respondeu. Verifique no painel Vercel."
}

# ==============================
# 9️⃣ Enviar alerta Telegram
# ==============================
$telegram_url = "https://api.telegram.org/bot$telegram_bot_token/sendMessage"
$body_telegram = @{ chat_id = $telegram_chat_id; text = $message } | ConvertTo-Json
Invoke-RestMethod -Uri $telegram_url -Method POST -ContentType "application/json" -Body $body_telegram
Write-Log "📩 Alerta Telegram enviado."

Write-Log "✅ UltraDeploy360-PRO finalizado!"
