#Requires -Version 7
<#
Script: fix-jsx-namespace.ps1
Autor: Richeles Assistant
Função:
Corrige o erro "Cannot find namespace 'JSX'" no componente SmartWeather.tsx,
substituindo JSX.Element por React.ReactElement e garantindo o import correto.
#>

Write-Host "🧠 Corrigindo namespace JSX no SmartWeather.tsx..." -ForegroundColor Cyan
$path = "app\components\SmartWeather.tsx"

if (Test-Path $path) {
    $code = Get-Content $path -Raw

    # Adiciona import React no topo se estiver ausente
    if ($code -notmatch "import\s+React") {
        $code = "import React from 'react';`r`n$code"
        Write-Host "➕ Import React adicionado no topo do arquivo." -ForegroundColor Green
    }

    # Corrige JSX.Element -> React.ReactElement
    if ($code -match "JSX\.Element") {
        $code = $code -replace "JSX\.Element", "React.ReactElement"
        Write-Host "✅ Substituído: JSX.Element -> React.ReactElement" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Nenhuma ocorrência de JSX.Element encontrada (já pode estar corrigido)." -ForegroundColor Yellow
    }

    # Salva com codificação UTF-8 sem BOM
    Set-Content -Path $path -Value $code -Encoding UTF8
    Write-Host "💾 Arquivo atualizado com sucesso!" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Arquivo SmartWeather.tsx não encontrado no caminho esperado!" -ForegroundColor Red
    exit
}

# Limpa o cache do Next.js
Write-Host "🧹 Limpando cache .next ..." -ForegroundColor DarkGray
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

# Rebuild do projeto
Write-Host "⚙️ Executando build final..." -ForegroundColor Cyan
npm run build
