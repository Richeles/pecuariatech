#Requires -Version 7
<#
Corrige definitivamente a linha de interpolação de URL em SmartWeather.tsx
#>

Write-Host "🧩 Corrigindo template string da URL no SmartWeather.tsx..." -ForegroundColor Cyan
$path = "app\components\SmartWeather.tsx"

if (Test-Path $path) {
    $code = Get-Content $path -Raw

    # Substitui QUALQUER linha problemática que tenha \\?\\ ou erro de escape
    $code = $code -replace 'const url\s*=.*', '  const url = `${base}?${params.toString()}`;'

    # Salva de novo em UTF-8 puro
    Set-Content -Path $path -Value $code -Encoding UTF8

    Write-Host "✅ Linha corrigida com template string JavaScript válido!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Arquivo SmartWeather.tsx não encontrado." -ForegroundColor Yellow
}

Write-Host "🧹 Limpando cache..." -ForegroundColor DarkGray
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "⚙️ Executando novo build..." -ForegroundColor Cyan
npm run build
