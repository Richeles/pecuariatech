#Requires -Version 7
<#
Script: fix-dashboard-encoding.ps1
Autor: Richeles Assistant
Objetivo: Corrigir encoding corrompido em app/dashboard/page.tsx
#>

Write-Host "🧠 Corrigindo encoding do dashboard..." -ForegroundColor Cyan

$projectRoot = "C:\Users\Administrador\pecuariatech"
$file = Join-Path $projectRoot "app\dashboard\page.tsx"

if (-not (Test-Path $file)) {
    Write-Host "❌ Arquivo não encontrado: $file" -ForegroundColor Red
    exit
}

# Cria backup antes de alterar
Copy-Item $file "$file.bak_utf8" -Force
Write-Host "💾 Backup criado em: $file.bak_utf8" -ForegroundColor Yellow

# Lê o conteúdo como bytes e converte corretamente
$bytes = [System.IO.File]::ReadAllBytes($file)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)

# Corrige todos os caracteres corrompidos
$text = $text `
    -replace 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â ', '📊' `
    -replace 'ÃƒÆ’Ã‚Â', 'Á' `
    -replace 'ÃƒÆ’Ã‚Â§', 'ç' `
    -replace 'ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â¾', '🌱' `
    -replace 'ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬Å¾', '🐄' `
    -replace 'ÃƒÂ¡', 'á' `
    -replace 'ÃƒÂ©', 'é' `
    -replace 'ÃƒÂ­', 'í' `
    -replace 'ÃƒÂ³', 'ó' `
    -replace 'ÃƒÂº', 'ú' `
    -replace 'ÃƒÂ§', 'ç' `
    -replace 'ÃƒÂ', 'ã'

# Regrava o arquivo corrigido em UTF-8 com BOM
$Utf8Bom = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllText($file, $text, $Utf8Bom)

Write-Host "✅ Encoding do dashboard corrigido com sucesso!" -ForegroundColor Green
Write-Host "⚙️ Limpando cache e rebuildando..." -ForegroundColor Yellow

if (Test-Path "$projectRoot\.next") { Remove-Item -Recurse -Force "$projectRoot\.next" }
Set-Location $projectRoot
npm run build
