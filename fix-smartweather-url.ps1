#Requires -Version 7
<#
Corrige o erro de escape de string em SmartWeather.tsx
#>

Write-Host "🧩 Corrigindo escape da URL em SmartWeather.tsx..." -ForegroundColor Cyan
$path = "app\components\SmartWeather.tsx"

if (Test-Path $path) {
    $code = Get-Content $path -Raw

    # Corrige a linha com as barras invertidas erradas
    $code = $code -replace 'const url = \\\\?\\\\;', 'const url = `${base}?${params.toString()}`;'

    Set-Content -Path $path -Value $code -Encoding UTF8
    Write-Host "✅ Corrigido: linha da URL ajustada com interpolação JS válida." -ForegroundColor Green
} else {
    Write-Host "⚠️ Arquivo não encontrado: $path" -ForegroundColor Yellow
}

Write-Host "🧹 Limpando cache e build..." -ForegroundColor DarkGray
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "⚙️ Executando build novamente..." -ForegroundColor Cyan
npm run build
