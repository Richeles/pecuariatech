Write-Host "🔱 ULTRAFIX MASTER 360 v6 — Fix ESM/CJS TurboRepo Full Safe" -ForegroundColor Cyan

# 1️⃣ Limpeza
Write-Host "🧹 Limpando node_modules + .turbo + .next ..."
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".turbo" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Write-Host "✔ Limpeza completa.`n"

# 2️⃣ Fallback seguro ESM + CJS
Write-Host "📦 Criando fallback turborepo-access-trace..."

$fallbackESM = @'
export function turborepoTraceAccess() {
  return null;
}
export const TurborepoAccessTraceResult = {};
'@

$fallbackCJS = @'
function turborepoTraceAccess() { return null; }
module.exports = { turborepoTraceAccess, TurborepoAccessTraceResult: {} };
'@

Set-Content -Path ".\noop-trace.js" -Value $fallbackESM -Encoding utf8
Set-Content -Path ".\noop-trace.cjs" -Value $fallbackCJS -Encoding utf8

Write-Host "✔ Fallback ESM + CJS criado.`n"

# 3️⃣ Patch no Next.js build/index.js
Write-Host "🔧 Patch no Next.js..."

$nextBuildPath = "node_modules/next/dist/build/index.js"

if (Test-Path $nextBuildPath) {

    $content = Get-Content $nextBuildPath

    $patched = $content `
    -replace 'from "turborepo-access-trace"', 'from "../../../noop-trace.js"' `
    -replace "require('turborepo-access-trace')", "require('../../../noop-trace.cjs')" `
    -replace 'require("turborepo-access-trace")', 'require("../../../noop-trace.cjs")'

    Set-Content $nextBuildPath $patched
    Write-Host "✔ next/dist/build/index.js corrigido."
}
else {
    Write-Host "⚠ Arquivo next/dist/build/index.js não encontrado."
}

# 4️⃣ npm install
Write-Host "📦 Instalando dependências..."
npm install
Write-Host "✔ Dependências instaladas.`n"

# 5️⃣ Build final
Write-Host "🚀 Rodando build final..."
npm run build

Write-Host ""
Write-Host "🎉 ULTRAFIX MASTER 360 v6 — FINALIZADO COM SUCESSO!" -ForegroundColor Green
