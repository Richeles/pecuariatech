<# 
 Script: fix-bom.ps1
 Autor: Richeles Alves dos Santos ⚙️
 Função: Remover BOM (Byte Order Mark) de arquivos UTF-8 do projeto PecuariaTech.
#>

$Root = "C:\Users\Administrador\pecuariatech"
$LogDir = Join-Path $Root "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "fix-bom-$Date.log"
$Count = 0

Write-Host "🧹 Limpando BOM dos arquivos em $Root ..." -ForegroundColor Cyan

# Extensões de arquivos a corrigir
$exts = "*.ts","*.tsx","*.js","*.jsx","*.json","*.html","*.css"

Get-ChildItem -Path $Root -Include $exts -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Encoding Byte
    if ($content.Length -ge 3 -and $content[0] -eq 0xEF -and $content[1] -eq 0xBB -and $content[2] -eq 0xBF) {
        $contentNoBOM = $content[3..($content.Length-1)]
        [System.IO.File]::WriteAllBytes($_.FullName, $contentNoBOM)
        Write-Host "✔️ BOM removido: $($_.FullName)" -ForegroundColor Green
        "Removido BOM -> $($_.FullName)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        $Count++
    }
}

if ($Count -eq 0) {
    Write-Host "✅ Nenhum arquivo com BOM encontrado." -ForegroundColor Yellow
} else {
    Write-Host "`n💾 Log salvo em: $LogFile" -ForegroundColor Cyan
    Write-Host "🧩 Total de arquivos corrigidos: $Count" -ForegroundColor Green
}

Write-Host "`n⚙️ Agora execute novamente:" -ForegroundColor Magenta
Write-Host "npm run build" -ForegroundColor Yellow
