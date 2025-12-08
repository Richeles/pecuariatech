# ultrabiologica_cloud_v5.2.ps1
# UltraCloud 360º CLEAN v5.2 - Limpeza de arquivos grandes e backup

# Definir timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Criar pasta de backup
$backupFolder = "backup_clean_$timestamp"
New-Item -ItemType Directory -Name $backupFolder

# Criar arquivo de log
$logFile = ".\scripts\logs\clean_$timestamp.log"
if (!(Test-Path ".\scripts\logs")) { New-Item -ItemType Directory -Name ".\scripts\logs" }

Write-Host "📝 Iniciando limpeza UltraCloud 360º..."
Add-Content $logFile "=== Limpeza iniciada em $(Get-Date) ===`n"

# Limpar arquivos grandes (>8MB) exceto código
Get-ChildItem -Recurse | Where-Object {
    $_.Length -gt 8MB -and $_.Extension -notin ".ts", ".tsx", ".js", ".jsx"
} | ForEach-Object {
    # Copiar para backup
    Copy-Item $_ -Destination $backupFolder -Force
    # Remover arquivo original
    Remove-Item $_ -Force
    Add-Content $logFile "Removido: $($_.FullName) - $(($_.Length/1MB) -as [int]) MB"
}

# Limpar cache do Next.js
$nextCache = ".next"
if (Test-Path $nextCache) {
    Copy-Item $nextCache $backupFolder -Recurse -Force
    Remove-Item $nextCache -Recurse -Force
    Add-Content $logFile "Cache Next.js removido: $nextCache"
}

Add-Content $logFile "`n=== Limpeza concluída em $(Get-Date) ==="
Write-Host "✅ Limpeza concluída! Backup em: $backupFolder"
Write-Host "📄 Log gerado em: $logFile"
