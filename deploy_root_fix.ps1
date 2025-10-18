# =========================================================
# deploy_root_fix.ps1 - UltraBiológica Cloud / PecuariaTech
# Automatiza backup, commit, deploy e verificação online
# =========================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ------------------------------
# Configurações do projeto
# ------------------------------
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$BackupPath = Join-Path $ProjectPath "backup_app_$(Get-Date -Format yyyyMMdd_HHmmss)"
$LogFile = Join-Path $ProjectPath "vercel_deploy_log.txt"
$VercelDomain = "www.pecuariatech.com"

# Caminho absoluto do Vercel CLI
$VercelCmd = "$env:APPDATA\npm\vercel.cmd --prod --yes --alias $VercelDomain"

# ------------------------------
# Função de log
# ------------------------------
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message"
}

# ------------------------------
# Início do deploy
# ------------------------------
Log-Info "🚀 Iniciando correção da raiz e deploy UltraBiológica Cloud final..."

# Backup da pasta app
if (Test-Path "$ProjectPath\app") {
    Copy-Item -Path "$ProjectPath\app" -Destination $BackupPath -Recurse -Force
    Log-Info "✅ Backup da pasta app criado em: $BackupPath"
}

# Corrigir página raiz / redirecionamento para /dashboard
$RootPage = Join-Path $ProjectPath "app\page.tsx"
if (-Not (Test-Path $RootPage)) {
    @"
import { redirect } from 'next/navigation';

export default function RootPage() {
    redirect('/dashboard');
}
"@ | Set-Content -Path $RootPage -Encoding utf8 -Force
    Log-Info "✅ Página raiz app/page.tsx criada com redirecionamento para /dashboard"
}

# ------------------------------
# Commit automático
# ------------------------------
Set-Location $ProjectPath
git add .
git commit -m "fix: adicionar página raiz / redirecionamento para /dashboard" -a
git push origin main
Log-Info "📦 Alterações enviadas ao GitHub"

# ------------------------------
# Deploy na Vercel
# ------------------------------
try {
    Log-Info "🚀 Iniciando deploy de produção na Vercel ($VercelDomain)..."
    & $VercelCmd 2>&1 | Tee-Object -FilePath $LogFile
    Log-Info "✅ Deploy finalizado. Log salvo em: $LogFile"
    Log-Info "🌐 Site disponível em: https://$VercelDomain"
}
catch {
    Log-Info "⚠️ Erro durante o deploy: $_"
}

# ------------------------------
# Verificação básica online
# ------------------------------
$PagesToCheck = @(
    "/dashboard",
    "/financeiro",
    "/rebanho",
    "/pastagem",
    "/ultrachat",
    "/ultrabiologica/status"
)

foreach ($page in $PagesToCheck) {
    $url = "https://$VercelDomain$page"
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -Method GET
        if ($resp.StatusCode -eq 200) {
            Write-Host "✅ $url OK"
        } else {
            Write-Host "❌ $url - StatusCode: $($resp.StatusCode)"
        }
    } catch {
        Write-Host "❌ $url - $_"
    }
}

Log-Info "✅ Script finalizado."
