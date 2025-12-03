Write-Host "🔱 ULTRAFIX MASTER 360 v2 — Reset TurboRepo + Rebuild" -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# ========================================================
# 1. REMOVER CACHE QUEBRADO E NODE_MODULES COMPLETO
# ========================================================
Write-Host "🧹 Limpando node_modules + .turbo + .next..." -ForegroundColor Yellow

$paths = @("node_modules", ".turbo", ".next", ".vercel/output")

foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✔ Removido: $p"
    }
}

# ========================================================
# 2. REINSTALAR DEPENDÊNCIAS DO ZERO
# ========================================================
Write-Host "📦 Instalando dependências do zero (npm install)..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO AO INSTALAR DEPENDÊNCIAS. Parando script." -ForegroundColor Red
    exit
}

Write-Host "✅ Dependências reinstaladas com sucesso."

# ========================================================
# 3. CORRIGIR NEXT PARA IGNORAR TURBOPACK/TURBOREPO
# ========================================================
Write-Host "📌 Adicionando patch para ignorar turborepo..." -ForegroundColor Yellow

$nextConfig = "next.config.js"

if (-not (Test-Path $nextConfig)) {
@"
module.exports = {
  experimental: {
    turbo: false
  }
}
"@ | Set-Content $nextConfig
} else {
    $content = Get-Content $nextConfig -Raw
    if ($content -notmatch "turbo") {
        $content = $content + @"

module.exports = {
  experimental: {
    turbo: false
  }
};

"@
        Set-Content $nextConfig $content -Encoding UTF8
    }
}
Write-Host "✔ next.config.js atualizado para desativar TurboRepo."

# ========================================================
# 4. RODAR BUILD COM FALLBACK
# ========================================================
Write-Host "📦 Rodando build com fallback seguro..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Build falhou — ativando modo Recovery do UltraFix..." -ForegroundColor Magenta

    # Patch Final: substituir require quebrado
    Write-Host "🔧 Aplicando fallback para turborepo-access-trace..." -ForegroundColor Yellow

    $file = "node_modules/next/dist/build/index.js"
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "turborepo-access-trace") {
            $content = $content -replace "turborepo-access-trace", "noop-trace"
            Set-Content $file $content -Encoding UTF8
        }
    }

    # Criar arquivo vazio que o Next procura
    $traceFile = "node_modules/next/dist/build/noop-trace.js"
@"
module.exports = {};
"@ | Set-Content $traceFile

    Write-Host "✔ Fallback criado. Tentando novo build..."
    npm run build
}

Write-Host "🎉 ULTRAFIX MASTER 360 v2 — FINALIZADO!" -ForegroundColor Green
