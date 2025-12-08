# UltraRun360-Final-v2.ps1
# Richeles Alves - Execução completa PecuariaTech

Write-Host "🚀 UltraRun360-Final-v2 Iniciando..." -ForegroundColor Cyan

# 1️⃣ Definir diretório raiz
$root = "C:\Users\Administrador\pecuariatech"
Set-Location $root

# 2️⃣ Validar package.json
$packageJsonPath = Join-Path $root "package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "❌ package.json não encontrado! Abortando..." -ForegroundColor Red
    exit
}

try {
    $jsonContent = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    Write-Host "✅ package.json válido"
} catch {
    Write-Host "❌ package.json inválido! Corrija a sintaxe antes de continuar." -ForegroundColor Red
    exit
}

# 3️⃣ Remover postinstall do Prisma se existir
if ($jsonContent.scripts.postinstall) {
    Write-Host "🔧 Removendo postinstall do package.json..."
    $jsonContent.scripts.PSObject.Properties.Remove("postinstall")
    $jsonContent | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
    Write-Host "✅ postinstall removido"
}

# 4️⃣ Instalar dependências críticas
Write-Host "📦 Instalando dependências essenciais..."
npm install next@latest react react-dom esbuild-register --save-dev

# 5️⃣ Criar backup seguro de arquivos grandes e cache
Write-Host "💾 Criando backup de arquivos grandes e cache..."
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFolder = Join-Path $root "backup_clean_$timestamp"
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

# Copiar arquivos >8MB (exceto código)
Get-ChildItem -Recurse $root | Where-Object {
    $_.Length -gt 8MB -and $_.Extension -notin ".ts",".tsx",".js",".jsx"
} | ForEach-Object {
    $destFile = Join-Path $backupFolder $_.Name
    if (-not (Test-Path $destFile)) {
        Copy-Item $_ -Destination $backupFolder -Force
        Remove-Item $_ -Force
        Write-Host "Removido e backup:" $_.FullName
    } else {
        Write-Host "⚠️ Arquivo já existe no backup, pulando:" $_.Name
    }
}

# Limpar cache .next
$nextCache = Join-Path $root ".next"
if (Test-Path $nextCache) {
    $cacheBackup = Join-Path $backupFolder ".next"
    Copy-Item $nextCache $cacheBackup -Recurse -Force
    Remove-Item $nextCache -Recurse -Force
    Write-Host "✅ Cache .next removido e backup criado"
}

# 6️⃣ Validar Next.js
if (-not (Test-Path "$root\node_modules\next")) {
    Write-Host "⚠️ Next.js não encontrado, instalando..."
    npm install next@latest
}

# 7️⃣ Executar UltraFixMaster360-ProMax
Write-Host "🔧 Executando UltraFixMaster360-ProMax..."
$fixScript = Join-Path $root "scripts\UltraFixMaster360-ProMax.ps1"
if (Test-Path $fixScript) {
    & $fixScript
    Write-Host "✅ UltraFixMaster360-ProMax concluído"
} else {
    Write-Host "⚠️ Script UltraFixMaster360-ProMax.ps1 não encontrado!"
}

# 8️⃣ Rodar servidor Next.js
Write-Host "🌐 Iniciando servidor local Next.js..."
npm run dev
