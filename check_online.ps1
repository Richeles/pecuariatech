# check_online.ps1
# Verificação online do PecuariaTech
# Rodar da raiz do projeto

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Criar pasta de logs se não existir
$LogDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "ultra_check_$timestamp.log"

function Write-Log {
    param([string]$Message, [string]$Level="INFO")
    $prefix = "[{0}][{1}]" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level
    $line = "$prefix $Message"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line
}

Write-Log "Iniciando verificação online do PecuariaTech"

# URLs principais
$pages = @(
    "/", "/dashboard", "/financeiro", "/rebanho", "/pastagem", "/ultrachat", "/ultrabiologica/status"
)
$baseUrl = "https://www.pecuariatech.com"

foreach ($page in $pages) {
    try {
        $url = "$baseUrl$page"
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) {
            Write-Host "✅ $url OK" -ForegroundColor Green
            Add-Content -Path $LogFile -Value "✅ $url OK"
        } else {
            Write-Host "❌ $url - Status $($resp.StatusCode)" -ForegroundColor Red
            Add-Content -Path $LogFile -Value "❌ $url - Status $($resp.StatusCode)"
        }
    } catch {
        Write-Host "❌ $url - $_" -ForegroundColor Red
        Add-Content -Path $LogFile -Value "❌ $url - $_"
    }
}

# APIs que precisam de POST
$apisPost = @(
    "/api/predict_weight", "/api/ultrachat"
)
$payload = @{ "test" = "ok" } | ConvertTo-Json

foreach ($api in $apisPost) {
    try {
        $url = "$baseUrl$api"
        $resp = Invoke-WebRequest -Uri $url -Method POST -Body $payload -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) {
            Write-Host "✅ $url OK (POST)" -ForegroundColor Green
            Add-Content -Path $LogFile -Value "✅ $url OK (POST)"
        } else {
            Write-Host "❌ $url - Status $($resp.StatusCode)" -ForegroundColor Red
            Add-Content -Path $LogFile -Value "❌ $url - Status $($resp.StatusCode)"
        }
    } catch {
        Write-Host "❌ $url - $_" -ForegroundColor Red
        Add-Content -Path $LogFile -Value "❌ $url - $_"
    }
}

Write-Log "Verificação online finalizada. Log completo em: $LogFile"
