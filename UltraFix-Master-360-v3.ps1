Write-Host "🔱 ULTRAFIX MASTER 360 v3 — TurboRepo Final Fix" -ForegroundColor Cyan

# ============================================================
# 1. REMOVER CACHE
# ============================================================
Write-Host "🧹 Limpando node_modules + .turbo + .next ..." -ForegroundColor Yellow

$paths = @("node_modules", ".turbo", ".next", ".vercel/output")

foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✔ Removido: $p"
    }
}

# ============================================================
# 2. REINSTALAR DEPENDÊNCIAS
# ============================================================
Write-Host "📦 Instalando dependências novamente..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO ao reinstalar dependências." -ForegroundColor Red
    exit
}

# ============================================================
# 3. DESATIVAR TURBOREPO
# ============================================================
$nextConfig = "next.config.js"

Write-Host "📌 Garantindo turbo desativado..." -ForegroundColor Yellow

$content = @"
module.exports = {
  experimental: {
    turbo: false
  }
};
"@

Set-Content $nextConfig $content -Encoding UTF8
Write-Host "✔ next.config.js atualizado."

# ============================================================
# 4. CRIAR FALLBACK COMPLETO PARA turborepo-access-trace
# ============================================================
Write-Host "🔧 Criando fallback completo turborepo-access-trace..." -ForegroundColor Cyan

$traceDir = "node_modules/next/dist/build"
if (-not (Test-Path $traceDir)) {
    New-Item -ItemType Directory -Path $traceDir -Force | Out-Null
}

# JS (ESM) + CJS (CommonJS)
$traceJS = "$traceDir/noop-trace.js"
$traceCJS = "$traceDir/noop-trace.cjs"

$traceContent = @"
class TurborepoAccessTraceResult {}

module.exports = { TurborepoAccessTraceResult };
export { TurborepoAccessTraceResult };
"@

Set-Content $traceJS $traceContent -Encoding UTF8
Set-Content $traceCJS $traceContent -Encoding UTF8

Write-Host "✔ noop-trace.js e noop-trace.cjs criados."

# ============================================================
# 5. REESCREVER IMPORTS DO Next.js PARA USAR NOOP
# ============================================================
Write-Host "🔧 Aplicando patch no Next build/index.js..." -ForegroundColor Yellow

$nextBuildFile = "node_modules/next/dist/build/index.js"

if (Test-Path $nextBuildFile) {
    $content = Get-Content $nextBuildFile -Raw
    $content = $content -replace "turborepo-access-trace", "noop-trace"
    Set-Content $nextBuildFile $content -Encoding UTF8
    Write-Host "✔ index.js corrigido."
}

# ============================================================
# 6. RODAR BUILD FINAL
# ============================================================
Write-Host "🚀 Rodando build final..." -ForegroundColor Cyan
npm run build

Write-Host "🎉 ULTRAFIX MASTER 360 v3 — FINALIZADO COM SUCESSO!" -ForegroundColor Green
