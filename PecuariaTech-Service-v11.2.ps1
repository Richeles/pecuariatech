# ============================================================
# PecuariaTech-Service v11.2 — Triângulo 360° Estável
# DNS + HTTPS + REST + JSON local + Supabase (opcional)
# Compatível com PowerShell 7.5.x
# ============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$VERSION      = "v11.2"
$DOMAIN       = "www.pecuariatech.com"
$STATUS_FILE  = "C:\Users\Administrador\pecuariatech\triangulo360_status.json"
$INTERVAL_SEC = 300   # 5 minutos

# Tabelas REST que queremos testar (você pode editar depois se quiser)
$REST_TABLES = @(
    "pastagem",
    "rebanho",
    "financeiro",
    "racas",
    "dashboard"
)

# Nome da tabela de logs no Supabase (opcional)
$SUPABASE_LOG_TABLE = "triangulo360_logs"

# ============================================================
# VARIÁVEIS DE AMBIENTE (Supabase)
# ============================================================

$SUPABASE_URL       = $env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY_WRITE = $env:PECUARIA_SUPABASE_KEY_WRITE

if (-not $SUPABASE_URL) {
    $SUPABASE_URL = Read-Host "Informe a URL do Supabase (ex: https://xxxx.supabase.co)"
    setx PECUARIA_SUPABASE_URL $SUPABASE_URL | Out-Null
}
if (-not $SUPABASE_KEY_WRITE) {
    $SUPABASE_KEY_WRITE = Read-Host "Informe a Service Role KEY do Supabase"
    setx PECUARIA_SUPABASE_KEY_WRITE $SUPABASE_KEY_WRITE | Out-Null
}

$NODE_ID = $env:COMPUTERNAME
if (-not $NODE_ID) { $NODE_ID = "PecuariaTechNode" }

$global:SupabaseEnabled = $true  # se der 404 na tabela de logs, desliga

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
# TESTES TRIÂNGULO 360°
# ============================================================

function Test-DNS {
    param([string]$Host)

    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Resolve-DnsName -Name $Host -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item   = "DNS"
            status = "OK"
            ms     = [int]$sw.ElapsedMilliseconds
            detail = "resolvido"
        }
    }
    catch {
        return @{
            item   = "DNS"
            status = "FAIL"
            ms     = 0
            detail = $_.Exception.Message
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
            item   = "HTTPS"
            status = "OK"
            ms     = [int]$sw.ElapsedMilliseconds
            detail = "200 OK"
        }
    }
    catch {
        return @{
            item   = "HTTPS"
            status = "FAIL"
            ms     = 0
            detail = $_.Exception.Message
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
            apikey        = $Key
            Authorization = "Bearer $Key"
        } -TimeoutSec 10 -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item   = ("REST-{0}" -f $Table)
            status = "OK"
            ms     = [int]$sw.ElapsedMilliseconds
            detail = "consulta ok"
        }
    }
    catch {
        $msg = $_.Exception.Message
        if ($msg.Length -gt 200) { $msg = $msg.Substring(0,200) + "..." }

        # Diferenciar 404 de outros erros
        $statusText = "FAIL"
        if ($msg -match "404") { $statusText = "FAIL_404" }

        return @{
            item   = ("REST-{0}" -f $Table)
            status = $statusText
            ms     = 0
            detail = $msg
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
        Log ("Dashboard atualizado: {0}" -f $STATUS_FILE) "OK"
    }
    catch {
        Log ("Erro ao salvar JSON do dashboard: {0}" -f $_.Exception.Message) "WARN"
    }
}

# ============================================================
# ENVIO PARA SUPABASE (LOGS)
# ============================================================

function Send-ToSupabase {
    param(
        [hashtable]$Record
    )

    if (-not $global:SupabaseEnabled) {
        return
    }

    $baseUrl = $SUPABASE_URL.TrimEnd("/")
    $urlLogs = "{0}/rest/v1/{1}" -f $baseUrl, $SUPABASE_LOG_TABLE

    # Sanitizar detalhe
    $detail = $Record.detail
    if ($detail -and $detail.Length -gt 240) {
        $detail = $detail.Substring(0,240) + "..."
    }

    $payload = @(
        @{
            horario = (Get-Date).ToString("s")
            node_id = $NODE_ID
            item    = $Record.item
            status  = $Record.status
            ms      = [int]$Record.ms
            detalhe = $detail
            versao  = $VERSION
        }
    )

    $body = $payload | ConvertTo-Json -Depth 4

    try {
        Invoke-RestMethod -Uri $urlLogs -Method Post -Body $body -Headers @{
            apikey        = $SUPABASE_KEY_WRITE
            Authorization = "Bearer $SUPABASE_KEY_WRITE"
            "Content-Type" = "application/json"
            Prefer        = "return=minimal"
        } -TimeoutSec 10 -ErrorAction Stop | Out-Null

        Log ("Supabase OK → {0}" -f $Record.item) "OK"
    }
    catch {
        $msg = $_.Exception.Message
        if ($msg -match "404") {
            Log ("Tabela de logs '{0}' não encontrada (404). Desativando Supabase logging." -f $SUPABASE_LOG_TABLE) "WARN"
            $global:SupabaseEnabled = $false
        }
        else {
            Log ("Falha ao enviar para Supabase: {0}" -f $msg) "WARN"
        }
    }
}

# ============================================================
# LOOP PRINCIPAL
# ============================================================

Log ("PecuariaTech-Service {0} iniciado. Node={1}" -f $VERSION, $NODE_ID) "INFO"
Log ("Domínio monitorado: {0}" -f $DOMAIN) "INFO"
Log ("Supabase: {0}" -f $SUPABASE_URL) "INFO"
Log ("Intervalo: {0} segundos" -f $INTERVAL_SEC) "INFO"

while ($true) {
    Log "=== Novo ciclo Triângulo 360° ===" "INFO"

    $results = @()

    # 1) DNS
    $dns = Test-DNS -Host $DOMAIN
    Log ("DNS => {0} ({1} ms)" -f $dns.status, $dns.ms) ($dns.status -eq "OK" ? "OK" : "FAIL")
    $results += $dns

    # 2) HTTPS
    $httpsUrl = "https://{0}" -f $DOMAIN
    $https = Test-HTTPS -Url $httpsUrl
    Log ("HTTPS => {0} ({1} ms)" -f $https.status, $https.ms) ($https.status -eq "OK" ? "OK" : "FAIL")
    $results += $https

    # 3) REST (para cada tabela configurada)
    foreach ($t in $REST_TABLES) {
        $r = Test-REST -Table $t -BaseUrl $SUPABASE_URL -Key $SUPABASE_KEY_WRITE

        $lvl = if ($r.status -eq "OK") { "OK" } else { "FAIL" }
        Log ("REST-{0} => {1}" -f $t, $r.status) $lvl

        $results += $r
    }

    # HEALTHSCORE
    $total = $results.Count
    $oks   = ($results | Where-Object { $_.status -eq "OK" }).Count
    $fails = $total - $oks

    if ($total -gt 0) {
        $health = [math]::Round(100 * ($oks / $total), 2)
    } else {
        $health = 0
    }

    $cycle = [ordered]@{
        timestamp   = (Get-Date).ToString("s")
        node_id     = $NODE_ID
        version     = $VERSION
        healthscore = $health
        ok          = $oks
        fail        = $fails
        results     = $results
    }

    Save-StatusJson -Cycle $cycle

    foreach ($rec in $results) {
        Send-ToSupabase -Record $rec
    }

    Log ("Ciclo finalizado. HealthScore = {0}%" -f $health) "INFO"
    Log ("Aguardando {0} segundos..." -f $INTERVAL_SEC) "INFO"
    Start-Sleep -Seconds $INTERVAL_SEC
}
