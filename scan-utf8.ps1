#Requires -Version 7
<#
  Script: scan-utf8.ps1
  Objetivo: Fazer varredura de encoding e caracteres corrompidos no projeto PecuariaTech
  Autor: Assistente GPT-5 para Richeles
#>

$ErrorActionPreference = "Stop"

Write-Host "🔍 Iniciando varredura de encoding e caracteres inválidos..." -ForegroundColor Cyan

$root = "C:\Users\Administrador\pecuariatech"
$logPath = Join-Path $root "logs\utf8-scan-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

if (-not (Test-Path (Split-Path $logPath))) {
    New-Item -ItemType Directory -Force -Path (Split-Path $logPath) | Out-Null
}

$files = Get-ChildItem -Path $root -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.json,*.html,*.css -ErrorAction SilentlyContinue
$total = $files.Count
$i = 0
$issues = @()

foreach ($file in $files) {
    $i++
    Write-Progress -Activity "Varredura de arquivos..." -Status ("{0} / {1}: {2}" -f $i, $total, $file.Name) -PercentComplete (($i / $total) * 100)

    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $utf8  = [System.Text.Encoding]::UTF8.GetString($bytes)

        if ($utf8 -match 'Ãƒ|Ã‚|Ã¢â‚¬|Â|Ã…') {
            $issues += "❌ $($file.FullName) → contém caracteres mojibake"
        }

        if ($utf8 -match '[\u200B-\u200F\uFEFF]') {
            $issues += "⚠️ $($file.FullName) → contém caracteres invisíveis (BOM/ZWNJ/LRM)"
        }

        $reencoded = [System.Text.Encoding]::UTF8.GetBytes($utf8)
        if ($bytes.Length -ne $reencoded.Length) {
            $issues += "⚡ $($file.FullName) → encoding suspeito (tamanho difere após reencode)"
        }
    }
    catch {
        $issues += "💀 ERRO: $($file.FullName) → $($_.Exception.Message)"
    }
}

if ($issues.Count -eq 0) {
    Write-Host "✅ Nenhum problema de encoding encontrado." -ForegroundColor Green
} else {
    $issues | Out-File -FilePath $logPath -Encoding UTF8
    Write-Host "⚠️ Foram encontrados $($issues.Count) arquivos com possíveis problemas." -ForegroundColor Yellow
    Write-Host "📄 Relatório salvo em: $logPath" -ForegroundColor Cyan
}

Write-Host "`n✅ Varredura concluída!" -ForegroundColor Green
