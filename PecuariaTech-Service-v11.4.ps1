# =======================================================================
# PecuariaTech-Service v11.4 FINAL PRODUCTION
# Triângulo 360° + REST Validation + Supabase Logging + Dashboard JSON
# Compatível com PowerShell 7.5+
# =======================================================================

$VERSION = "v11.4"
$DOMAIN  = "www.pecuariatech.com"

# ---------------- PATHS LOCAIS ----------------
$BASE_PATH      = "C:\Users\Administrador\pecuariatech"
$STATUS_FILE    = "$BASE_PATH\triangulo360_status.json"
$LOG_TABLE      = "triangulo360_logs"

# ---------------- SUPABASE VARIÁVEIS ----------------
$SUPABASE_URL        = $env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY_WRITE  = $env:PECUARIA_SUPABASE_KEY_WRITE
$SUPABASE_KEY_READ   = $env:PECUARIA_SUPABASE_KEY_READ

if (-not $SUPABASE_KEY_READ)  { $SUPABASE_KEY_READ = $SUPABASE_KEY_WRITE }
if (-not $SUPABASE_URL -or -not $SUPABASE_KEY_WRITE) {
    Write-Host "[FATAL] Variáveis Supabase ausentes." -ForegroundColor Red
    exit 1
}

# ---------------- INFOS DO SISTEMA ----------------
$Node = $env:COMPUTERNAME
if (-not $Node) { $Node = "unknown-PC" }

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

# =======================================================================
# TESTE DNS
# =======================================================================
function Test-DNS {
    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Resolve-DnsName -Name $DOMAIN -Type A -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{ status="OK"; detail="DNS resolvido"; ms=[int]$sw.Elapsed.TotalMilliseconds }
    }
    catch {
        return @{ status="FAIL"; detail=$_.Exception.Message; ms=0 }
    }
}

# =======================================================================
# TESTE HTTPS
# =======================================================================
function Test-HTTPS {
    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Invoke-WebRequest -Uri "https://$DOMAIN" -TimeoutSec 6 -UseBasicParsing -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{ status="OK"; detail="200 OK"; ms=[int]$sw.Elapsed.TotalMilliseconds }
    }
    catch {
        return @{ status="FAIL"; detail=$_.Exception.Message; ms=0 }
    }
}

# =======================================================================
# TESTE REST (tabelas detectadas)
# =======================================================================
$TABLES = @("pastagem", "rebanho", "financeiro", "racas", "dashboard")

function Test-REST {
    param([string]$table)

    $URL = "$SUPABASE_URL/rest/v1/$table?select=id&limit=1"

    try {
        Invoke-RestMethod -Uri $URL -Headers @{
            apikey=$SUPABASE_KEY_READ
            Authorization="Bearer $SUPABASE_KEY_READ"
        } -TimeoutSec 6 -ErrorAction Stop | Out-Null

        return @{ status="OK"; detail="REST ativo"; ms=1 }
    }
    catch {
        return @{ status="FAIL"; detail=$_.Exception.Message; ms=0 }
    }
}

# =======================================================================
# ENVIAR LOG PARA SUPABASE
# =======================================================================
function Push-Log {
    param([string]$item,[string]$status,[string]$detail,[int]$ms)

    $Payload = @(
        @{
            horario = (Get-Date).ToString("s")
            node_id = $Node
            item    = $item
            status  = $status
            detalhe = $detail.Substring(0, [Math]::Min(190, $detail.Length))
            ms      = $ms
            versao  = $VERSION
        }
    )

    try {
        Invoke-RestMethod -Method POST `
            -Uri "$SUPABASE_URL/rest/v1/$LOG_TABLE" `
            -Headers @{
                apikey=$SUPABASE_KEY_WRITE
                Authorization="Bearer $SUPABASE_KEY_WRITE"
                Prefer="return=minimal"
                "Content-Type"="application/json"
            } `
            -Body ($Payload | ConvertTo-Json -Depth 6) `
            -TimeoutSec 10 `
            -ErrorAction Stop | Out-Null

        Log "Supabase log => $item [$status]" "OK"
    }
    catch {
        Log "Erro Supabase: $($_.Exception.Message)" "FAIL"
    }
}

# =======================================================================
# ATUALIZAR DASHBOARD JSON LOCAL
# =======================================================================
function Update-Dashboard {
    param([Hashtable]$cycle)

    try {
        $cycle | ConvertTo-Json -Depth 10 | Out-File -FilePath $STATUS_FILE -Encoding utf8
        Log "Dashboard atualizado: $STATUS_FILE" "OK"
    }
    catch {
        Log "Erro ao salvar dashboard JSON" "FAIL"
    }
}

# =======================================================================
# CICLO TRIÂNGULO 360°
# =======================================================================

Log "📡 PecuariaTech-Service $VERSION iniciado. Node=$Node" "INFO"
Log "Domínio: $DOMAIN" "INFO"
Log "Supabase: $SUPABASE_URL" "INFO"
Log "Intervalo: 300s" "INFO"

while ($true) {

    Log "=== Novo ciclo Triângulo 360° ===" "INFO"

    # -------------------- DNS --------------------
    $dns = Test-DNS
    Log "DNS => $($dns.status) ($($dns.ms) ms)" $dns.status
    Push-Log "DNS" $dns.status $dns.detail $dns.ms

    # -------------------- HTTPS --------------------
    $https = Test-HTTPS
    Log "HTTPS => $($https.status) ($($https.ms) ms)" $https.status
    Push-Log "HTTPS" $https.status $https.detail $https.ms

    # -------------------- REST --------------------
    $rest_results = @{}
    foreach ($t in $TABLES) {
        $r = Test-REST -table $t
        Log "REST-$t => $($r.status)" $r.status
        Push-Log "REST-$t" $r.status $r.detail $r.ms
        $rest_results[$t] = $r
    }

    # -------------------- HEALTHSCORE --------------------
    $oks = 0
    if ($dns.status  -eq "OK") { $oks++ }
    if ($https.status -eq "OK") { $oks++ }
    foreach ($t in $TABLES) { if ($rest_results[$t].status -eq "OK") { $oks++ } }

    $HealthScore = [math]::Round(($oks / (2 + $TABLES.Count)) * 100, 2)

    Log "Ciclo finalizado • HealthScore = $HealthScore%" "INFO"

    # -------------------- JSON DE ESTADO --------------------
    $cycle = @{
        timestamp = (Get-Date).ToString("s")
        node      = $Node
        dns       = $dns
        https     = $https
        rest      = $rest_results
        health    = $HealthScore
        versao    = $VERSION
    }

    Update-Dashboard $cycle

    Log "Aguardando 300 segundos..." "INFO"
    Start-Sleep -Seconds 300
}
