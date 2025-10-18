# deploy_ultrabiologica_final.ps1
Set-ExecutionPolicy Bypass -Scope Process -Force

$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogFile = Join-Path $ProjectPath "vercel_deploy_log.txt"
$CustomDomain = "www.pecuariatech.com"
$BackupDir = Join-Path $ProjectPath ("backup_app_" + (Get-Date -Format "yyyyMMdd_HHmmss"))

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
    Write-Host $line
}

Log "🚀 Iniciando deploy UltraBiológica Cloud final..."

# --- Verifica .env.local ---
$envFile = Join-Path $ProjectPath ".env.local"
if (-not (Test-Path $envFile)) {
    Log "❌ .env.local não encontrado. Crie antes de rodar o deploy."
    exit 1
} else {
    Get-Content $envFile | ForEach-Object { 
        if ($_ -match "^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$") { 
            [System.Environment]::SetEnvironmentVariable($matches[1],$matches[2].Trim())
        }
    }
    Log "✅ .env.local carregado"
}

# --- Backup da pasta app ---
if (Test-Path (Join-Path $ProjectPath "app")) {
    Copy-Item -Path (Join-Path $ProjectPath "app") -Destination $BackupDir -Recurse -Force
    Log "💾 Backup da pasta app criado em: $BackupDir"
}

# --- Corrige import SWRegister ---
$layoutFile = Join-Path $ProjectPath "app\layout.tsx"
if (Test-Path $layoutFile) {
    (Get-Content $layoutFile) -replace "@\/components\/SWRegister", "..\/components\/SWRegister" | Set-Content $layoutFile -Encoding UTF8
    Log "✅ Import SWRegister corrigido"
}

# --- Git add, commit e push ---
Set-Location $ProjectPath
git add .
git commit -m "fix: corrigir import SWRegister e garantir PWA funcional" | Out-Null
git push origin main | Out-Null
Log "📦 Alterações enviadas ao GitHub"

# --- Deploy Vercel com domínio personalizado ---
Log "🚀 Iniciando deploy de produção para $CustomDomain..."
$v
