# ================================================================
# PECUARIATECH SERVICE v11.0 — POWER SHELL EDITION
# Triângulo 360 • Supabase • Dashboard JSON • Loop contínuo
# ================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$VERSION = "v11.0"
$NODE = $env:COMPUTERNAME
$STATUS_FILE = "C:\Users\Administrador\pecuariatech\triangulo360_status.json"

# ===== VARIÁVEIS DE AMBIENTE =====
$SUPABASE_URL = $env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY = $env:PECUARIA_SUPABASE_KEY_WRITE

if (-not $SUPABASE_URL) {
    $SUPABASE_URL = Read-Host "Informe a URL do Supabase (https://xxxx.supabase.co)"
    setx PECUARIA_SUPABASE_URL $SUPABASE_URL | Out-Null
}

if (-not $SUPABASE_KEY) {
    $SUPABASE_KEY = Read-Host "Informe a Service Role KEY do Supabase"
    setx PECUARIA_SUPABASE_KEY_WRITE $SUPABASE_KEY | Out-Null
}

# ================================================================
function Log {
    param([string]$msg, [string]$level = "INFO")

    $color = switch ($level) {
        "OK"    { "Green" }
        "FAIL"  { "Red" }
        "WARN"  { "Yellow" }
        default { "Cyan" }
    }

    $ts = (Get-Date).ToString("HH:mm:ss")
    Write-Host "[$ts][$level] $msg" -ForegroundColor $color
}

# ================================================================
function Test-DNS {
    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Resolve-DnsName "www.pecuariatech.com" -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{ item="DNS"; status="OK"; ms=$sw.ElapsedMilliseconds; detail="resolvido" }
    } catch {
        return @{ item="DNS"; status="FAIL"; ms=0; detail=$_.Exception.Message }
    }
}

function Test-HTTPS {
    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Invoke-WebRequest -Uri "https://www.pecuariatech.com" -UseBasicParsing -TimeoutSec 7
        $sw.Stop()
        return @{ item="HTTPS"; status="OK"; ms=$sw.ElapsedMilliseconds; detail="200 OK" }
    } catch {
        return @{ item="HTTPS"; status="FAIL"; ms=0; detail=$_.Exception.Message }
    }
}

function Test-REST {
    param([string]$table)

    try {
        $url = "$SUPABASE_URL/rest/v1/$table?select=*&limit=1"
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Invoke-RestMethod -Uri $url `
            -Headers @{
                apikey = $SUPABASE_KEY
                Authorization = "Bearer $SUPABASE_KEY"
            } `
            -TimeoutSec 10 -ErrorAction Stop | Out-Null
        $sw.Stop()

        return @{ item="REST-$table"; status="OK"; ms=$sw.ElapsedMilliseconds; detail="consulta ok" }

    } catch {
        return @{ item="REST-$table"; status="FAIL"; ms=0; detail=$_.Exception.Message }
    }
}

# ================================================================
function Save-StatusJson {
    param($cycle)

    $cycle | ConvertTo-Json -Depth 10 | Out-File -FilePath $STATUS_FILE -Encoding UTF8
    Log "Dashboard atualizado: triangulo360_status.json" "OK"
}

function Send-To-Supabase {
    param($record)

    $payload = @(
        @{
            horario = (Get-Date).ToString("s")
            node_id = $NODE
            item    = $record.item
            status  = $record.status
            ms      = $record.ms
            detalhe = $record.detail
            versao  = $VERSION
        }
    ) | ConvertTo-Json -Depth 5 -Compress

    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/triangulo360_logs" `
            -Method POST `
            -Body $payload `
            -Headers @{
                apikey = $SUPABASE_KEY
                Authorization = "Bearer $SUPABASE_KEY"
                "Content-Type" = "application/json"
                Prefer = "return=minimal"
            } `
            -TimeoutSec 10

        Log "Enviado para Supabase: $($record.item)" "OK"

    } catch {
        Log "Supabase erro: $($_.Exception.Message)" "FAIL"
    }
}

# ================================================================

$tables = @("pastagem","rebanho","financeiro","racas","dashboard","triangulo360_logs")

Log "📡 PecuariaTech-Service $VERSION iniciado…" "INFO"

while ($true) {
    $dns = Test-DNS
    Log "DNS => $($dns.status) ($($dns.ms) ms)" $dns.status

    $https = Test-HTTPS
    Log "HTTPS => $($https.status) ($($https.ms) ms)" $https.status

    $restResults = @()
    foreach ($t in $tables) {
        $r = Test-REST -table $t
        Log "REST-$t => $($r.status)" $r.status
        $restResults += $r
    }

    # HEALTH SCORE
    $all = @($dns, $https) + $restResults
    $oks = ($all | Where-Object { $_.status -eq "OK" }).Count
    $fails = $all.Count - $oks
    $health = [math]::Round(100 * ($oks / $all.Count), 2)

    $cycle = @{
        timestamp = (Get-Date).ToString("s")
        node_id   = $NODE
        version   = $VERSION
        healthscore = $health
        ok = $oks
        fail = $fails
        results = $all
    }

    Save-StatusJson $cycle

    foreach ($r in $all) { Send-To-Supabase $r }

    Log "Ciclo finalizado • HealthScore = $health%" "INFO"
    Log "Aguardando 300 segundos…" "INFO"

    Start-Sleep -Seconds 300
}
