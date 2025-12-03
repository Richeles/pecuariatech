# ============================================================
# PecuariaTech-Service v17.2 PRO-PAINEL
# Richeles - Triângulo 360° Inteligente + Painel Online
# ============================================================

$VERSION = "v17.2"
$INTERVAL = 300
$DOMAIN = "www.pecuariatech.com"
$SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"
$SUPABASE_TABLE = "triangulo360_logs"
$NODE = $env:COMPUTERNAME

# ===================== INPUT TOKEN ===========================
if (-not $env:PECUARIA_TRIANGULO_TOKEN) {
    $token = Read-Host "Informe o token secreto do painel (PECUARIA_TRIANGULO_TOKEN)"
    setx PECUARIA_TRIANGULO_TOKEN $token | Out-Null
    $env:PECUARIA_TRIANGULO_TOKEN = $token
}

$PANEL_TOKEN = $env:PECUARIA_TRIANGULO_TOKEN
$PANEL_URL = "https://$DOMAIN/api/triangulo360/push"


# ===================== LOG ==================================
function Log {
    param([string]$msg, [string]$level = "INFO")
    $now = (Get-Date).ToString("HH:mm:ss")

    $color = switch ($level) {
        "OK"      { "Green" }
        "FAIL"    { "Red" }
        "WARN"    { "Yellow" }
        default   { "Cyan" }
    }

    Write-Host "[$now][$level] $msg" -ForegroundColor $color
}

# ===================== DNS TEST ==============================
function Test-DNS360 {
    param([string]$HostName)

    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        Resolve-DnsName $HostName -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{ item="DNS"; status="OK"; ms=[int]$sw.Elapsed.TotalMilliseconds; detail="resolvido" }
    } catch {
        return @{ item="DNS"; status="FAIL"; ms=0; detail="falha DNS" }
    }
}

# ===================== HTTPS TEST ============================
function Test-HTTPS360 {
    param([string]$url)

    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        $r = Invoke-WebRequest -Uri $url -TimeoutSec 7 -UseBasicParsing
        $sw.Stop()
        return @{ item="HTTPS"; status="OK"; ms=[int]$sw.Elapsed.TotalMilliseconds; detail=$r.StatusCode }
    }
    catch {
        return @{ item="HTTPS"; status="FAIL"; ms=0; detail=$_.Exception.Message }
    }
}

# ===================== REST TEST =============================
function Test-REST360 {
    param([string]$table)

    $url = "$SUPABASE_URL/rest/v1/$table?select=id&limit=1"
    $headers = @{
        apikey = $env:SUPABASE_SERVICE_ROLE_KEY
        Authorization = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
    }

    $sw = [Diagnostics.Stopwatch]::StartNew()

    try {
        Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec 7
        $sw.Stop()
        return @{ item="REST-$table"; status="OK"; ms=[int]$sw.Elapsed.TotalMilliseconds; detail="consulta ok" }
    } catch {
        return @{ item="REST-$table"; status="FAIL"; ms=0; detail="erro consulta" }
    }
}

# ===================== PAINEL ONLINE =========================
function Send-Panel {
    param([Hashtable]$payload)

    $json = $payload | ConvertTo-Json -Depth 8 -Compress

    $headers = @{
        "x-triangulo-token" = $PANEL_TOKEN
        "Content-Type"      = "application/json"
    }

    for ($i=1; $i -le 3; $i++) {
        try {
            Invoke-RestMethod -Method Post -Uri $PANEL_URL -Headers $headers -Body $json -TimeoutSec 8
            Log "Painel online atualizado." "OK"
            return
        } catch {
            Log "Painel falhou (tentativa $i): $($_.Exception.Message)" "WARN"
            Start-Sleep -Seconds (2 * $i)
        }
    }

    Log "Painel offline após 3 tentativas." "FAIL"
}

# ===================== LOOP =================================
Write-Host "[INFO] Iniciando PecuariaTech-Service $VERSION..."

while ($true) {

    Log "=== Novo ciclo Triângulo 360° ==="

    $dns = Test-DNS360 $DOMAIN
    Log "$($dns.item) => $($dns.status) ($($dns.ms) ms) - $($dns.detail)" $dns.status

    $https = Test-HTTPS360 "https://$DOMAIN"
    Log "$($https.item) => $($https.status) ($($https.ms) ms) - $($https.detail)" $https.status

    $restResults = @()
    foreach ($t in @("pastagem","rebanho","financeiro","racas","dashboard")) {
        $r = Test-REST360 $t
        $restResults += $r
        Log "$($r.item) => $($r.status) ($($r.ms) ms)" $r.status
    }

    # ===================== HEALTH SCORE ======================
    $okCount = ($dns.status, $https.status, $restResults.status | Where-Object { $_ -eq "OK" }).Count
    $health = [math]::Round(($okCount / 7) * 100, 2)

    # ===================== PAYLOAD ===========================
    $payload = @{
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        node      = $NODE
        health    = $health
        results   = @($dns, $https) + $restResults
    }

    # ===================== PAINEL ONLINE =====================
    Send-Panel $payload

    # ===================== DASHBOARD LOCAL ==================
    $payload | ConvertTo-Json -Depth 10 | Out-File "triangulo360_status.json"
    Log "Dashboard JSON atualizado: triangulo360_status.json" "OK"

    Start-Sleep -Seconds $INTERVAL
}
