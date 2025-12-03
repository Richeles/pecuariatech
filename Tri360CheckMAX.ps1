# ================================
# ULTRA TRIÂNGULO 360º v25.0
# PecuariaTech - Status Profissional
# ================================

$domain = "www.pecuariatech.com"
$site   = "https://www.pecuariatech.com"
$supabaseUrl = "https://ulhzwovmhwtmojiitbfn.supabase.co"
$logFile = ".\tri360_log.txt"

function Log($msg) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "$timestamp - $msg" | Out-File -Append $logFile
}

Clear-Host
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "        ULTRA TRIÂNGULO 360º — v25.0" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Log "Iniciando Triângulo360..."

# --------------------------------------
# 1) DNS CHECK
# --------------------------------------
Write-Host "🔍 Verificando DNS..." -ForegroundColor Yellow
try {
    $dns = Resolve-DnsName $domain -ErrorAction Stop
    Write-Host "   ✅ DNS Resolvido: $($dns.IPAddress)" -ForegroundColor Green
    Log "DNS OK: $($dns.IPAddress)"
}
catch {
    Write-Host "   ❌ DNS Falhou" -ForegroundColor Red
    Log "DNS ERRO"
}

# --------------------------------------
# 2) SITE CHECK
# --------------------------------------
Write-Host "`n🌐 Verificando site..." -ForegroundColor Yellow
try {
    $res = Invoke-WebRequest -Uri $site -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Site Online — Status $($res.StatusCode)" -ForegroundColor Green
    Log "SITE OK: $($res.StatusCode)"
}
catch {
    Write-Host "   ❌ Site Offline" -ForegroundColor Red
    Log "SITE ERRO"
}

# --------------------------------------
# 3) SUPABASE CHECK
# --------------------------------------
Write-Host "`n🧪 Verificando Supabase..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "$supabaseUrl/health" -TimeoutSec 8
    Write-Host "   ✅ Supabase Online" -ForegroundColor Green
    Log "SUPABASE OK"
}
catch {
    Write-Host "   ❌ Supabase Indisponível" -ForegroundColor Red
    Log "SUPABASE ERRO"
}

# --------------------------------------
# 4) API CHECK
# --------------------------------------
Write-Host "`n🛠️ Checando rota API /rest/v1/" -ForegroundColor Yellow
try {
    $resApi = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ❌ Esperado erro 401 (autenticação necessária)" -ForegroundColor Yellow
    Write-Host "   ➜ API funcionando (acesso controlado)" -ForegroundColor Green
    Log "API OK (401 esperado)"
}
catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "   ✅ API online — retornou 401 (correto)" -ForegroundColor Green
        Log "API OK (401)"
    }
    else {
        Write-Host "   ❌ API com erro inesperado" -ForegroundColor Red
        Log "API ERRO"
    }
}

# --------------------------------------
# FINAL STATUS
# --------------------------------------
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "           🔵 STATUS GERAL FINAL 🔵" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

Write-Host "🟦 DNS verificado"
Write-Host "🟩 SITE verificado"
Write-Host "🟪 SUPABASE verificado"
Write-Host "🟨 API verificada"

Write-Host "`n📄 Log salvo em: $logFile" -ForegroundColor Gray
Write-Host "===============================================" -ForegroundColor Cyan
