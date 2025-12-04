# UltraDeploy.ps1
# Script completo para deploy do PecuariaTech, garantindo que o domínio funcione

# ==============================
# CONFIGURAÇÕES
# ==============================
$dominio = "www.pecuariatech.com"
$github_branch = "main"
$vercel_project = "pecuariatech"
$vercel_token = "COLOQUE_SEU_TOKEN_VERCEL_AQUI" # Você precisa gerar na Vercel (Account > Tokens)
$max_retries = 5
$wait_seconds = 10

# ==============================
# FUNÇÃO: Verifica domínio
# ==============================
function Test-Dominio {
    param([string]$url)
    try {
        $response = Invoke-WebRequest -Uri "https://$url" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) { return $true }
        else { return $false }
    } catch {
        return $false
    }
}

# ==============================
# 1️⃣ Checar domínio
# ==============================
$retries = 0
while ($retries -lt $max_retries) {
    Write-Host "🔎 Checando domínio $dominio (tentativa $($retries+1)/$max_retries)..."
    if (Test-Dominio $dominio) {
        Write-Host "✅ Domínio está respondendo."
        break
    } else {
        Write-Host "⚠ Domínio não respondeu. Aguardando $wait_seconds segundos..."
        Start-Sleep -Seconds $wait_seconds
        $retries++
    }
}
if ($retries -eq $max_retries) {
    Write-Host "❌ Domínio $dominio não está respondendo. Abortando deploy."
    exit 1
}

# ==============================
# 2️⃣ Limpar build antigo
# ==============================
Write-Host "🧹 Limpando .next e node_modules..."
Remove-Item -Recurse -Force .next,node_modules -ErrorAction SilentlyContinue

# ==============================
# 3️⃣ Instalar dependências
# ==============================
Write-Host "📦 Instalando dependências..."
npm install

# ==============================
# 4️⃣ Rodar build
# ==============================
Write-Host "🏗️ Rodando build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou. Abortando deploy."
    exit 1
}

# ==============================
# 5️⃣ Commit e push Git
# ==============================
Write-Host "🔀 Commitando alterações..."
git add .
git commit -m "UltraDeploy automático: build e atualização" -ErrorAction SilentlyContinue
git push origin $github_branch

# ==============================
# 6️⃣ Redeploy no Vercel
# ==============================
Write-Host "🚀 Forçando redeploy no Vercel..."
$headers = @{ "Authorization" = "Bearer $vercel_token" }
$body = @{ "name" = $vercel_project } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Method POST -Headers $headers -Body $body

Write-Host "✅ Deploy enviado para Vercel. Aguardar alguns segundos para propagar."

# ==============================
# 7️⃣ Verificar site atualizado
# ==============================
Start-Sleep -Seconds 15
if (Test-Dominio $dominio) {
    Write-Host "🎉 Site $dominio está online e atualizado!"
} else {
    Write-Host "⚠️ Site $dominio ainda não respondeu. Verifique no painel Vercel."
}
