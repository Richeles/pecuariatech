# UltraDeploy360.ps1
# Script completo para deploy do PecuariaTech com Triângulo 360º

# ==============================
# CONFIGURAÇÕES
# ==============================
$dominio = "www.pecuariatech.com"
$github_branch = "main"
$vercel_project = "pecuariatech"
$vercel_token = "COLOQUE_SEU_TOKEN_VERCEL_AQUI" # Substitua pelo token da Vercel
$max_retries = 5
$wait_seconds = 10

# ==============================
# FUNÇÃO: Testa se domínio responde
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
# 1️⃣ Checar domínio antes de continuar
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
# 2️⃣ Limpar build antigo e node_modules
# ==============================
Write-Host "🧹 Limpando .next e node_modules..."
Remove-Item -Recurse -Force .next,node_modules -ErrorAction SilentlyContinue

# ==============================
# 3️⃣ Remover lockfiles conflitantes
# ==============================
$lockfiles = @("C:\Users\Administrador\package-lock.json", ".\package-lock.json")
foreach ($lock in $lockfiles) {
    if (Test-Path $lock) {
        Write-Host "🗑️ Removendo lockfile: $lock"
        Remove-Item $lock -Force
    }
}

# ==============================
# 4️⃣ Instalar dependências
# ==============================
Write-Host "📦 Instalando dependências..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao instalar dependências. Abortando."
    exit 1
}

# ==============================
# 5️⃣ Rodar build
# ==============================
Write-Host "🏗️ Rodando build Next.js..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou. Abortando deploy."
    exit 1
}

# ==============================
# 6️⃣ Commit e push GitHub
# ==============================
Write-Host "🔀 Commitando alterações..."
git add .
git commit -m "UltraDeploy360: Build e atualização Triângulo 360º" -ErrorAction SilentlyContinue
git push origin $github_branch

# ==============================
# 7️⃣ Redeploy no Vercel
# ==============================
Write-Host "🚀 Forçando redeploy no Vercel..."
$headers = @{ "Authorization" = "Bearer $vercel_token" }
$body = @{ "name" = $vercel_project } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Method POST -Headers $headers -Body $body

# ==============================
# 8️⃣ Aguardar e verificar site
# ==============================
Write-Host "⏳ Aguardando propagação do site..."
Start-Sleep -Seconds 15

if (Test-Dominio $dominio) {
    Write-Host "🎉 Site $dominio está online e atualizado com Triângulo 360º!"
} else {
    Write-Host "⚠️ Site $dominio ainda não respondeu. Verifique no painel Vercel."
}
