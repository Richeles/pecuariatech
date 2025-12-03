Write-Host "🔱 ULTRAPACK 1000 — PecuariaTech FULL AUTO" -ForegroundColor Cyan
Write-Host ""

# 1️⃣ LIMPEZA GERAL
Write-Host "🧹 UltraClean 360 — limpando pastas..."
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".turbo" -ErrorAction SilentlyContinue
Write-Host "✔ Limpeza concluída.`n"

# 2️⃣ AJUSTE next.config PARA CJS
Write-Host "🛠 Ajustando next.config para CJS..."

if (Test-Path "next.config.js") {
    Rename-Item -Path "next.config.js" -NewName "next.config.cjs" -Force
}

$config = @'
/** @type {import("next").NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        turbo: false
    }
};
module.exports = nextConfig;
'@

Set-Content -Path "next.config.cjs" -Value $config -Encoding utf8
Write-Host "✔ next.config.cjs configurado.`n"

# 3️⃣ Fallback turborepo-access-trace
Write-Host "🔧 Criando fallback TurboRepo..."

$esm = @'
export function turborepoTraceAccess() { return null; }
export const TurborepoAccessTraceResult = {};
'@

$cjs = @'
function turborepoTraceAccess() { return null; }
module.exports = { turborepoTraceAccess, TurborepoAccessTraceResult: {} };
'@

Set-Content ".\noop-trace.js" $esm
Set-Content ".\noop-trace.cjs" $cjs

Write-Host "✔ Fallback criado.`n"

# 4️⃣ PATCH seguro no next/dist/build/index.js (sem aspas duplas)
$index = "node_modules/next/dist/build/index.js"

if (Test-Path $index) {
    Write-Host "🔧 Patchando next/dist/build/index.js..."

    (Get-Content $index) |
        ForEach-Object {
            $_ -replace 'from "turborepo-access-trace"', 'from "../../../noop-trace.js"' `
               -replace "require('turborepo-access-trace')", "require('../../../noop-trace.cjs')" `
               -replace 'require("turborepo-access-trace")', "require('../../../noop-trace.cjs')"
        } | Set-Content $index

    Write-Host "✔ Patch aplicado.`n"
}
else {
    Write-Host "⚠ next/dist/build/index.js não encontrado (será patchado após npm install).`n"
}

# 5️⃣ Instalar deps
Write-Host "📦 Instalando dependências..."
npm install
Write-Host "✔ Dependências instaladas.`n"

# 6️⃣ Repatch após install (garantir)
if (Test-Path $index) {
    Write-Host "🔧 Aplicando patch final..."
    (Get-Content $index) |
        ForEach-Object {
            $_ -replace 'from "turborepo-access-trace"', 'from "../../../noop-trace.js"' `
               -replace "require('turborepo-access-trace')", "require('../../../noop-trace.cjs')" `
               -replace 'require("turborepo-access-trace")', "require('../../../noop-trace.cjs')"
        } | Set-Content $index

    Write-Host "✔ Patch final aplicado.`n"
}

# 7️⃣ Build final
Write-Host "🚀 UltraBuild 360 — Gerando build..."
npm run build

Write-Host ""
Write-Host "🎉 ULTRAPACK 1000 — FINALIZADO COM SUCESSO!" -ForegroundColor Green
