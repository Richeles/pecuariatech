Write-Host "🔧 Corrigindo Triangulo360 — UltraFix..." -ForegroundColor Cyan

# Caminhos
$trianguloPage = "C:\Users\Administrador\pecuariatech\app\triangulo360\page.tsx"
$trianguloComp = "C:\Users\Administrador\pecuariatech\components\ultracore\Triangulo360.tsx"

# Garantir que o page.tsx seja corrigido
if (Test-Path $trianguloPage) {
@'
"use client";

import Triangulo360 from "@/components/ultracore/Triangulo360";

export default function TrianguloPage() {
  return <Triangulo360 />;
}
'@ | Set-Content $trianguloPage -Encoding UTF8

    Write-Host "✅ page.tsx corrigido!" -ForegroundColor Green
}

# Se o componente tiver função chamada Page, renomear automaticamente
if (Test-Path $trianguloComp) {
    $content = Get-Content $trianguloComp -Raw

    if ($content -match "function Page") {
        Write-Host "⚠️  Conflito detectado: função 'Page' dentro do componente!" -ForegroundColor Yellow

        $content = $content -replace "function Page", "function TrianguloInnerPage"

        Set-Content $trianguloComp $content -Encoding UTF8
        Write-Host "🔄 Função interna renomeada para TrianguloInnerPage" -ForegroundColor Yellow
    }
}

# Limpar cache
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "🧹 Cache do Next limpo!" -ForegroundColor Yellow
}

# Build
Write-Host "📦 Rodando build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 BUILD OK — Pode fazer deploy com segurança!" -ForegroundColor Green
} else {
    Write-Host "❌ Falha no build — Envie o log" -ForegroundColor Red
}
