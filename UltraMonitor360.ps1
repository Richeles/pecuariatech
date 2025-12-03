# UltraMonitor360.ps1 – PecuariaTech
# Script único de monitoramento, status e Triângulo 360º

Write-Host "`n🔵 UltraMonitor 360º — Iniciando..." -ForegroundColor Cyan
$domain = "https://www.pecuariatech.com"
$apiStats = "$domain/api/ultra/stats"
$dashboard = "$domain/dashboard"
$logFile = "C:\Users\Administrador\pecuariatech\UltraMonitor360.log"

function Log($msg) {
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$time] $msg"
    Add-Content $logFile $line
    Write-Host $line -ForegroundColor Green
}

function Test-URL($url) {
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        return @{ ok = $true; status = $res.StatusCode }
    } catch {
        return @{ ok = $false; status = "ERROR" }
    }
}

function Check-Internet {
    try {
        Test-Connection -Count 1 -Quiet 8.8.8.8
    } catch {
        return $false
    }
}

Clear-Host
Write-Host "🔍 Checando serviços online..." -ForegroundColor Yellow

# 1️⃣ Internet
$internet = Check-Internet
if ($internet) {
    Log "🌐 Internet OK"
} else {
    Log "❌ Internet OFFLINE"
}

# 2️⃣ Domínio principal
$site = Test-URL $domain
if ($site.ok) {
    Log "🏠 Site carregando (200)"
} else {
    Log "❌ ERRO no site principal"
}

# 3️⃣ Dashboard
$dash = Test-URL $dashboard
if ($dash.ok) {
    Log "📊 Dashboard OK (200)"
} else {
    Log "❌ Dashboard fora do ar"
}

# 4️⃣ API Ultra Stats
$stats = Test-URL $apiStats
if ($stats.ok) {
    Log "🛠 API /api/ultra/stats OK"
} else {
    Log "❌ API UltraStats fora"
}

# 5️⃣ Log especial Triângulo 360
try {
    $triang = Invoke-RestMethod -Uri $apiStats -TimeoutSec 10
    Log "🟢 Triângulo 360º → Sistema: $($triang.health.status)"
    Log "🟢 Internet: $($triang.health.internet)"
    Log "🟢 Supabase: $($triang.health.supabase)"
    Log "🟢 CPU: $($triang.health.cpu)%"
} catch {
    Log "❌ Falha ao ler dados do Triângulo 360º"
}

Write-Host "`n🚀 UltraMonitor 360º FINALIZADO `n" -ForegroundColor Cyan
Write-Host "Logs salvos em: $logFile" -ForegroundColor Yellow
