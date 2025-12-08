# UltraRun360.ps1
# Richeles - Rodar PecuariaTech completo em uma etapa

Write-Host "🚀 UltraRun360º Iniciando..." -ForegroundColor Cyan

# 1️⃣ Definir diretório raiz
$root = "C:\Users\Administrador\pecuariatech"
Set-Location $root

# 2️⃣ Corrigir postinstall ausente (Prisma)
Write-Host "🔧 Corrigindo postinstall do package.json..."
$packageJsonPath = Join-Path $root "package.json"
(Get-Content $packageJsonPath) -replace '"postinstall": "node scripts/postinstall.js"', '' | Set-Content $packageJsonPath

# 3️⃣ Instalar dependências críticas
Write-Host "📦 Instalando dependências..."
npm install esbuild-register --save-dev
npm install

# 4️⃣ Limpeza de arquivos grandes e cache (.next)
Write-Host "🧹 Limpando arquivos grandes e cache..."
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFolder = Join-Path $root "backup_clean_$timestamp"
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

# Arquivos >8MB (exceto código)
Get-ChildItem -Recurse $root | Where-Object {
    $_.Length -gt 8MB -and $_.Extension -notin ".ts",".tsx",".js",".jsx"
} | ForEach-Object {
    Copy-Item $_ -Destination $backupFolder -Force
    Remove-Item $_ -Force
    Write-Host "Removido:" $_.FullName
}

# Limpar cache Next.js
$nextCache = Join-Path $root ".next"
if (Test-Path $nextCache) {
    Copy-Item $nextCache $backupFolder -Recurse -Force
    Remove-Item $nextCache -Recurse -Force
    Write-Host "Cache .next removido"
}

# 5️⃣ Corrigir código e layout com UltraFixMaster360
Write-Host "🔧 Corrigindo código/layout com UltraFixMaster360..."
$fixScript = Join-Path $root "scripts\UltraFixMaster360-ProMax.ps1"
if (Test-Path $fixScript) {
    & $fixScript
} else {
    Write-Host "⚠️ Script UltraFixMaster360-ProMax.ps1 não encontrado!"
}

# 6️⃣ Rodar servidor local
Write-Host "🌐 Iniciando servidor Next.js..."
npm run dev
