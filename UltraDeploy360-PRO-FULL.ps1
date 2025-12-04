# UltraDeploy360-PRO-FULL.ps1
# Richeles Alves - Deploy e Teste Completo Ultra360º

param(
    [string]$domain = "www.pecuariatech.com",
    [string]$vercelProject = "pecuariatech",
    [string]$vercelToken = "<SEU_VERCEL_TOKEN_AQUI>",
    [string]$telegramBotToken = "8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg",
    [string]$telegramChatId = "5567999564560"
)

# Função auxiliar para cores
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-ErrorLog($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Info "🔎 Checando domínio $domain..."
try {
    $resp = Invoke-WebRequest -Uri "https://$domain" -UseBasicParsing -TimeoutSec 10
    if ($resp.StatusCode -eq 200) { Write-Success "Domínio responde! StatusCode: $($resp.StatusCode)" } 
    else { Write-Warn "Domínio respondeu com StatusCode: $($resp.StatusCode)" }
} catch { Write-ErrorLog "Falha ao acessar domínio: $_" }

# Limpeza de caches e node_modules
Write-Info "🧹 Limpando .next e node_modules..."
Remove-Item -Recurse -Force .next, node_modules -ErrorAction SilentlyContinue

# Remover lockfiles duplicados
$lockFiles = @(".\package-lock.json", "$HOME\package-lock.json")
foreach ($file in $lockFiles) {
    if (Test-Path $file) {
        Write-Info "🗑️ Removendo lockfile: $file"
        Remove-Item $file -Force
    }
}

# Instalar dependências
Write-Info "📦 Instalando dependências..."
npm install

# Build Next.js
Write-Info "🏗️ Rodando build Next.js..."
npm run build

# Commit + Push alterações locais
Write-Info "💾 Commitando alterações locais..."
git add .
$commitMsg = "UltraDeploy360-PRO-FULL: Atualização automática $(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
git commit -m $commitMsg -ErrorAction SilentlyContinue
git push origin main

# Redeploy no Vercel via API
Write-Info "🚀 Forçando redeploy no Vercel..."
$headers = @{ Authorization = "Bearer $vercelToken" }
$body = @{ name = $vercelProject } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "https://api.vercel.com/v13/deployments" -Headers $headers -Body $body

# Verificação Triângulo 360º
Write-Info "🔹 Verificando Triângulo 360º no HTML..."
try {
    $html = (Invoke-WebRequest -Uri "https://$domain" -UseBasicParsing).Content
    if ($html -match "🌾 PecuariaTech - Triângulo 360º") { 
        Write-Success "Versão Triângulo 360º carregada!"
        $trianguloOK = $true
    } else {
        Write-Warn "Texto de verificação não encontrado."
        $trianguloOK = $false
    }
} catch { Write-ErrorLog "Erro ao verificar Triângulo 360º: $_"; $trianguloOK = $false }

# Teste webhook Telegram
Write-Info "📩 Testando webhook Telegram..."
try {
    $webhookBody = @{
        message = @{
            text = "D"
            chat = @{
                id = $telegramChatId
            }
        }
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Method POST -Uri "https://api.telegram.org/bot$telegramBotToken/sendMessage" -Body $webhookBody -ContentType "application/json"
    Write-Success "Webhook Telegram funcionando! MessageID: $($response.result.message_id)"
} catch { Write-ErrorLog "Erro no webhook: $_" }

# Relatório final
Write-Host "=============================="
Write-Host "✅ UltraDeploy360-PRO-FULL Concluído"
Write-Host "Domínio online: $($resp.StatusCode -eq 200)"
Write-Host "Versão Triângulo 360º carregada: $trianguloOK"
Write-Host "Webhook Telegram testado."
Write-Host "=============================="
