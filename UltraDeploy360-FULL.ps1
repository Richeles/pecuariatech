# UltraDeploy360-FULL.ps1
# Script único para automatizar deploy, build e testes do PecuariaTech Ultra360º

# Configurações
$projectDir = "C:\Users\Administrador\pecuariatech"
$domain = "www.pecuariatech.com"
$vercelProject = "pecuariatech"
$vercelToken = "COLE_SEU_TOKEN_AQUI"
$checkText = "Triângulo 360º"
$telegramBotToken = "COLE_SEU_BOT_TOKEN"
$chatId = "COLE_SEU_CHAT_ID"

# Função de log
function Log($msg, $type="INFO") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$type] $msg"
}

# Entrar no diretório do projeto
Set-Location $projectDir

# 1️⃣ Checar domínio
Log "🔎 Checando domínio $domain..."
try {
    $response = Invoke-WebRequest -Uri "http://$domain" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Log "✅ Domínio responde! StatusCode: $($response.StatusCode)"
    } else {
        Log "⚠️ Domínio retornou StatusCode: $($response.StatusCode)" "WARNING"
    }
} catch {
    Log "❌ Falha ao acessar domínio: $_" "ERROR"
}

# 2️⃣ Limpar build e node_modules
Log "🧹 Limpando .next e node_modules..."
Remove-Item -Recurse -Force ".next","node_modules" -ErrorAction SilentlyContinue

# 3️⃣ Remover lockfiles
$lockfiles = @(".\package-lock.json", "$env:USERPROFILE\package-lock.json")
foreach ($file in $lockfiles) {
    if (Test-Path $file) {
        Log "🗑️ Removendo lockfile: $file"
        Remove-Item $file -Force
    }
}

# 4️⃣ Instalar dependências
Log "📦 Instalando dependências..."
npm install

# 5️⃣ Rodar build do Next.js
Log "🏗️ Rodando build Next.js..."
npm run build

# 6️⃣ Commit e push das alterações
Log "💾 Commitando alterações..."
git add .
git commit -m "Atualização Ultra360º - Deploy automático $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main

# 7️⃣ Redeploy no Vercel
Log "🚀 Forçando redeploy no Vercel..."
vercel --token $vercelToken --prod --confirm

# 8️⃣ Teste de Triângulo 360º na página
Log "🔍 Verificando se Triângulo 360º está carregado..."
$pageContent = (Invoke-WebRequest -Uri "http://$domain" -UseBasicParsing).Content
if ($pageContent -match $checkText) {
    Log "✅ Triângulo 360º encontrado na página!"
} else {
    Log "⚠️ Triângulo 360º NÃO encontrado na página." "WARNING"
}

# 9️⃣ Teste webhook Telegram
Log "📩 Testando webhook Telegram..."
$body = @{ chat_id=$chatId; text="Teste webhook PecuariaTech Ultra360º"} | ConvertTo-Json
try {
    $telegramResp = Invoke-RestMethod -Uri "https://api.telegram.org/bot$telegramBotToken/sendMessage" -Method Post -Body $body -ContentType "application/json"
    if ($telegramResp.ok) { Log "✅ Webhook Telegram enviado com sucesso!" }
} catch {
    Log "❌ Erro ao enviar mensagem via Telegram: $_" "ERROR"
}

Log "=============================="
Log "✅ Deploy Ultra360º finalizado!"
