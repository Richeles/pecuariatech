#Requires -Version 7
<#
Corrige erro "Cannot find namespace 'JSX'" em SmartWeather.tsx
Adiciona import React e define JSX.Element corretamente
#>

Write-Host "🧩 Corrigindo JSX.Element em SmartWeather.tsx..." -ForegroundColor Cyan
$path = "app\components\SmartWeather.tsx"

if (Test-Path $path) {
    $code = Get-Content $path -Raw

    # Garante import do React no topo
    if ($code -notmatch 'import\s+React') {
        $code = "import React from 'react';`r`n$code"
    }

    # Corrige o tipo do componente
    $code = $code -replace 'SmartWeather\)\:\s*JSX\.Element', 'SmartWeather(): React.JSX.Element'

    Set-Content -Path $path -Value $code -Encoding UTF8
    Write-Host "✅ JSX corrigido e React importado!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Arquivo SmartWeather.tsx não encontrado." -ForegroundColor Yellow
}

Write-Host "🧹 Limpando cache..." -ForegroundColor DarkGray
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "⚙️ Executando build final..." -ForegroundColor Cyan
npm run build
