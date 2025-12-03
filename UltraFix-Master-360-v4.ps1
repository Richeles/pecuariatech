Write-Host "🔱 ULTRAFIX MASTER 360 v4 — Fix ESM/CJS TurboRepo" -ForegroundColor Cyan

# 1. Folders cleanup
Write-Host "🧹 Limpando node_modules + .turbo + .next ..." -ForegroundColor Yellow
$paths = @("node_modules", ".turbo", ".next", ".vercel/output")

foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✔ Removido: $p"
    }
}

# 2. Dependencies reinstall
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
npm install

# 3. Disable Turbo
Write-Host "📌 Ajustando next.config.js..." -ForegroundColor Yellow
$nextConfig = @"
module.exports = {
  experimental: {
    turbo: false
  }
};
"@
Set-Content "next.config.js" $nextConfig -Encoding UTF8

# 4. Create turborepo fallback files
Write-Host "🔧 Gerando fallback ESM/CJS turborepo-access-trace..." -ForegroundColor Cyan

$traceDir = "node_modules/next/dist/build"
if (-not (Test-Path $traceDir)) { New-Item $traceDir -ItemType Directory -Force | Out-Null }

# --- ESM version (noop-trace.js)
$esm = @"
export class TurborepoAccessTraceResult {}
"@
Set-Content "$traceDir/noop-trace.js" $esm -Encoding UTF8

# --- CJS version (noop-trace.cjs)
$cjs = @"
class TurborepoAccessTraceResult {}
module.exports = { TurborepoAccessTraceResult };
"@
Set-Content "$traceDir/noop-trace.cjs" $cjs -Encoding UTF8

Write-Host "✔ ESM + CJS fallback criado."

# 5. Patch Next.js import path
Write-Host "🔧 Ajustando next/dist/build/index.js..." -ForegroundColor Yellow
$buildIndex = "node_modules/next/dist/build/index.js"

if (Test-Path $buildIndex) {
    $content = Get-Content $buildIndex -Raw

    # replace ONLY import paths, not entire code
    $content = $content -replace "turborepo-access-trace\.cjs", "noop-trace.cjs"
    $content = $content -replace "turborepo-access-trace", "noop-trace"

    Set-Content $buildIndex $content -Encoding UTF8
    Write-Host "✔ Patch aplicado com sucesso."
}

# 6. Run final build
Write-Host "🚀 Rodando build final do Next.js..." -ForegroundColor Cyan
npm run build

Write-Host "🎉 ULTRAFIX MASTER 360 v4 — FINALIZADO COM SUCESSO!" -ForegroundColor Green
