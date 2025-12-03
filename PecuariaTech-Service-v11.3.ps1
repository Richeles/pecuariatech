# ============================================================
# PecuariaTech-Service v11.3 — Triângulo 360° Corrigido
# DNS + HTTPS + REST + JSON local + Supabase (opcional)
# Compatível com PowerShell 7.5.x
# ============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$VERSION      = "v11.3"
$DOMAIN       = "www.pecuariatech.com"
$STATUS_FILE  = "C:\Users\Administrador\pecuariatech\triangulo360_status.json"
$INTERVAL_SEC = 300   # 5 minutos

$REST_TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")
$SUPABASE_LOG_TABLE = "triangulo360_logs"

# ============================================================
# VARIÁVEIS DE AMBIENTE
# ============================================================

$SUPABASE_URL       = $env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY_WRITE = $env:PECUARIA_SUPABASE_KEY_WRITE

if (-not $SUPABASE_URL) {
    $SUPABASE_URL = Read-Host "Informe a URL do Supabase"
    setx PECUARIA_SUPABASE_URL $SUPABASE_URL | Out-Null
}

if (-not $SUPABASE_KEY_WRITE) {
    $SUPABASE_KEY_WRITE = Read-Host "Informe a Service Role KEY do Supabase"
    setx PECUARIA_SUPABASE_KEY_WRITE $SUPABASE_KEY_WRITE | Out-Null
}

$NODE_ID = $env:COMPUTERNAME
if (-not $NODE_ID) { $NODE_ID = "PecuariaTechNode" }

$global:SupabaseEnabled = $true

# ============================================================
# LOG COLORIDO
# ============================================================

function Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )

    $color = switch ($Level) {
        "OK"   { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }

    $ts = (Get-Date).ToString("HH:mm:ss")
    Write-Host ("[{0}][{1}] {2}" -f $ts, $Level, $Message) -ForegroundColor $color
}

# ============================================================
# TESTES 360°
# ============================================================

function Test-DNS {
    param([string]$Hostname)

    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Resolve-DnsName -Name $Hostname -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item="DNS";status="OK";ms=[int]$sw.ElapsedMilliseconds;detail="resolvido"
        }
    }
    catch {
        return @{
            item="DNS";status="FAIL";ms=0;detail=$_.Exception.Message
        }
    }
}

function Test-HTTPS {
    param([string]$Url)

    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 7 -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item="HTTPS";status="OK";ms=[int]$sw.ElapsedMilliseconds;detail="200 OK"
        }
    }
    catch {
        return @{
            item="HTTPS";status="FAIL";ms=0;detail=$_.Exception.Message
        }
    }
}

function Test-REST {
    param(
        [string]$Table,
        [string]$BaseUrl,
        [string]$Key
    )

    $url = "{0}/rest/v1/{1}?select=*&limit=1" -f $BaseUrl.TrimEnd("/"), $Table

    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Invoke-RestMethod -Uri $url -Headers @{
            apikey=$Key;Authorization="Bearer $Key"
        } -TimeoutSec 10 -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item="REST-$Table";status="OK";ms=[int]$sw.ElapsedMilliseconds;detail="consulta ok"
        }
    }
    catch {
        return @{
            item="REST-$Table";status="FAIL";ms=0;detail=$_.Exception.Message
        }
    }
}

# ============================================================
# JSON LOCAL PARA DASHBOARD
# ============================================================

function Save-StatusJson {
    param($Cycle)

    try {
        $json = $Cycle | ConvertTo-Json -Depth 6
        [System.IO.File]::WriteAllText($STATUS_FILE, $json, [System.Text.Encoding]::UTF8)
        Log "Dashboard atualizado: $STATUS_FILE" "OK"
    }
    catch {
        Log "Erro ao salvar JSON: $($_.Exception.Message)" "WARN"
    }
}

# ============================================================
# ENVIO PARA SUPABASE
# ============================================================

function Send-ToSupabase {
    param($Record)

    if (-not $global:SupabaseEnabled) { return }

    $url = "{0}/rest/v1/{1}" -f $SUPABASE_URL.TrimEnd("/"), $SUPABASE_LOG_TABLE

    $detail = $Record.detail
    if ($detail.Length -gt 240) { $detail = $detail.Substring(0,240) + "..." }

    $payload = @(
        @{
            horario = (Get-Date).ToString("s")
            node_id = $NODE_ID
            item    = $Record.item
            status  = $Record.status
            ms      = $Record.ms
            detalhe = $detail
            versao  = $VERSION
        }
    )

    try {
        Invoke-RestMethod -Uri $url -Method Post -Body ($payload|ConvertTo-Json) -Headers @{
            apikey=$SUPABASE_KEY_WRITE
            Authorization="Bearer $SUPABASE_KEY_WRITE"
            "Content-Type"="application/json"
        } -TimeoutSec 10 -ErrorAction Stop | Out-Null

        Log "Supabase OK → $($Record.item)" "OK"
    }
    catch {
        if ($_.Exception.Message -match "404") {
            Log "Tabela de logs '$SUPABASE_LOG_TABLE' não encontrada. Desativando Supabase logging." "WARN"
            $global:SupabaseEnabled = $false
        }
        else {
            Log "Erro ao enviar para Supabase: $($_.Exception.Message)" "WARN"
        }
    }
}

# ============================================================
# LOOP PRINCIPAL
# ============================================================

Log "PecuariaTech-Service $VERSION iniciado. Node=$NODE_ID" "INFO"
Log "Domínio: $DOMAIN" "INFO"

while ($true) {

    Log "=== Novo ciclo Triângulo 360° ===" "INFO"

    $results = @()

    # DNS
    $dns = Test-DNS -Hostname $DOMAIN
    Log "DNS => $($dns.status) ($($dns.ms) ms)" $dns.status
    $results += $dns

    # HTTPS
    $https = Test-HTTPS -Url ("https://$DOMAIN")
    Log "HTTPS => $($https.status) ($($https.ms) ms)" $https.status
    $results += $https

    # REST (tabelas)
    foreach ($t in $REST_TABLES) {
        $r = Test-REST -Table $t -BaseUrl $SUPABASE_URL -Key $SUPABASE_KEY_WRITE
        Log "REST-$t => $($r.status)" $r.status
        $results += $r
    }

    # HealthScore
    $total = $results.Count
    $oks   = ($results | Where-Object { $_.status -eq "OK" }).Count
    $health = [math]::Round(100 * ($oks / $total), 2)

    $cycle = [ordered]@{
        timestamp   = (Get-Date).ToString("s")
        version     = $VERSION
        node_id     = $NODE_ID
        healthscore = $health
        results     = $results
    }

    Save-StatusJson $cycle

    foreach ($r in $results) {
        Send-ToSupabase $r
    }

    Log "Ciclo finalizado • HealthScore = $health%" "INFO"
    Log "Aguardando $INTERVAL_SEC segundos..." "INFO"
    Start-Sleep -Seconds $INTERVAL_SEC
}
