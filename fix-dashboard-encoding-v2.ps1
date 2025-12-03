#Requires -Version 7
<#
  Script: fix-dashboard-encoding-v2.ps1
  Objetivo: Corrigir texto e encoding de app/dashboard/page.tsx de forma segura
#>

$ErrorActionPreference = "Stop"

Write-Host "🧠 Limpando e corrigindo dashboard (versão segura)..." -ForegroundColor Cyan

$Project = "C:\Users\Administrador\pecuariatech"
$File = Join-Path $Project "app\dashboard\page.tsx"

if (-not (Test-Path $File)) {
    Write-Host "❌ Arquivo não encontrado: $File" -ForegroundColor Red
    exit 1
}

# Backup
$Backup = "$File.bak_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $File $Backup -Force
Write-Host "💾 Backup criado em: $Backup" -ForegroundColor Yellow

# Lê o arquivo em UTF-8
$bytes = [System.IO.File]::ReadAllBytes($File)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)

# Remove caracteres ilegais e substitui conteúdo conhecido corrompido
# Substitui blocos conhecidos de mojibake, mas de forma neutra (sem emojis)
$text = $text -replace 'ÃƒÂ.', 'A' `
               -replace 'Ã¢â‚¬', '-' `
               -replace 'Ã…Â', '' `
               -replace 'Ã‚Â', '' `
               -replace 'Ãƒ', 'A' `
               -replace '[\x00-\x08\x0B\x0C\x0E-\x1F]', '' # limpa controle

# Corrige linhas com acentuação e títulos principais
$text = [regex]::Replace($text, "<h1[^>]*>.*?</h1>",
    "<h1 className='text-2xl font-bold mb-4'>📊 Dashboard PecuariaTech</h1>",
    'Singleline')

$text = [regex]::Replace($text,
    "(<Kpi[^>]*value\s*=\s*\{k\.area_total_ha\}[^>]*title\s*=\s*')[^']*(')",
    "`$1Área total (ha)`$2",
    'IgnoreCase')

$text = [regex]::Replace($text,
    "(<Kpi[^>]*value\s*=\s*\{k\.total_heads\}[^>]*title\s*=\s*')[^']*(')",
    "`$1Cabeças de gado`$2",
    'IgnoreCase')

# Salva em UTF-8 com BOM
$Utf8Bom = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllText($File, $text, $Utf8Bom)

Write-Host "✅ Dashboard limpo e corrigido com sucesso!" -ForegroundColor Green

# Limpa cache e executa build
if (Test-Path "$Project\.next") { Remove-Item -Recurse -Force "$Project\.next" }
Set-Location $Project
npm run build
