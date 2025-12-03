# =======================================================================
# PecuariaTech-Service v11.5 – Triângulo 360° + Logs Supabase
# DNS + HTTPS + REST + JSON local + Supabase logging
# Compatível com PowerShell 7.5.x
# =======================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$VERSION = "v11.5"
$DOMAIN  = "www.pecuariatech.com"

$BASE_PATH   = "C:\Users\Administrador\pecuariatech"
$STATUS_FILE = "$BASE_PATH\triangulo360_status.json"
$LOG_TABLE   = "triangulo360_logs"

# Tabelas REST do projeto
$TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")

# ================== SUPABASE VARIÁVEIS ==================

$SUPABASE_URL        = $env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY_WRITE  = $env:PECUARIA_SUPABASE_KEY_WRITE

if (-not $SUPABASE_URL) {
    $SUPABASE_URL = Read-Host "Informe a URL do Supabase (https://xxxxx.supabase.co)"
    setx PECUARIA_SUPABASE_URL $SUPABASE_URL | Out-Null
}
if (-not $SUPABASE_KEY_WRITE) {
    $SUPABASE_KEY_WRITE = Read-Host "Informe a Service Role KEY do Supabase"
    setx PECUARIA_SUPABASE_KEY_WRITE $SUPABASE_KEY_WRITE | Out-Null
}

$Node = $env:COMPUTERNAME
if (-not $Node) { $Node = "PecuariaTechNode" }

# ================== LOG COLORIDO ==================

function Log {
    param([string]$msg,[string]$level="INFO")

    $color = switch ($level) {
        "OK"   { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }
    $ts = (Get-Date).ToString("HH:mm:ss")
    Write-Host "[$ts][$level] $msg" -ForegroundColor $color
}

# ================== TESTES TRIÂNGULO 360° ==================

function Test-DNS {
    param([string]$Hostname)

    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Resolve-DnsName -Name $Hostname -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item="DNS"; status="OK"; ms=[int]$sw.ElapsedMilliseconds; detail="resolvido"
        }
    }
    catch {
        return @{
            item="DNS"; status="FAIL"; ms=0; detail=$_.Exception.Message
        }
    }
}

function Test-HTTPS {
    param([string]$Url)

    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Invoke-WebRequest -Uri $Url -TimeoutSec 7 -UseBasicParsing -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item="HTTPS"; status="OK"; ms=[int]$sw.ElapsedMilliseconds; detail="200 OK"
        }
    }
    catch {
        return @{
            item="HTTPS"; status="FAIL"; ms=0; detail=$_.Exception.Message
        }
    }
}

function Test-REST {
    param([string]$Table)

    $url = "{0}/rest/v1/{1}?select=*&limit=1" -f $SUPABASE_URL.TrimEnd("/"), $Table

    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Invoke-RestMethod -Uri $url -Headers @{
            apikey        = $SUPABASE_KEY_WRITE
            Authorization = "Bearer $SUPABASE_KEY_WRITE"
        } -TimeoutSec 10 -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item=("REST-{0}" -f $Table); status="OK"; ms=[int]$sw.ElapsedMilliseconds; detail="consulta ok"
        }
    }
    catch {
        $msg = $_.Exception.Message
        if ($msg.Length -gt 200) { $msg = $msg.Substring(0,200) + "..." }
        return @{
            item=("REST-{0}" -f $Table); status="FAIL"; ms=0; detail=$msg
        }
    }
}

# ================== LOGAR NO SUPABASE ==================

function Push-Log {
    param([hashtable]$Record)

    $detail = $Record.detail
    if ($detail -and $detail.Length -gt 190) {
        $detail = $detail.Substring(0,190) + "..."
    }

    $payload = @(
        @{
            horario = (Get-Date).ToString("s")
            node_id = $Node
            item    = $Record.item
            status  = $Record.status
            detalhe = $detail
            ms      = [int]$Record.ms
            versao  = $VERSION
        }
    )

    try {
        Invoke-RestMethod -Method Post `
            -Uri ("{0}/rest/v1/{1}" -f $SUPABASE_URL.TrimEnd("/"), $LOG_TABLE) `
            -Headers @{
                apikey        = $SUPABASE_KEY_WRITE
                Authorization = "Bearer $SUPABASE_KEY_WRITE"
                Prefer        = "return=minimal"
                "Content-Type"= "application/json"
            } `
            -Body ($payload | ConvertTo-Json -Depth 4) `
            -TimeoutSec 10 -ErrorAction Stop | Out-Null

        Log ("Supabase log => {0} [{1}]" -f $Record.item,$Record.status) "OK"
    }
    catch {
        Log ("Erro Supabase (log {0}): {1}" -f $Record.item,$_.Exception.Message) "WARN"
    }
}

# ================== DASHBOARD JSON ==================

function Update-DashboardJson {
    param($Results,[double]$Health)

    $cycle = [ordered]@{
        timestamp = (Get-Date).ToString("s")
        node      = $Node
        versao    = $VERSION
        health    = $Health
        results   = $Results
    }

    try {
        $cycle | ConvertTo-Json -Depth 10 | Out-File -FilePath $STATUS_FILE -Encoding UTF8
        Log ("Dashboard atualizado: {0}" -f $STATUS_FILE) "OK"
    }
    catch {
        Log ("Erro ao salvar JSON do dashboard: {0}" -f $_.Exception.Message) "WARN"
    }
}

# ================== LOOP PRINCIPAL ==================

Log ("📡 PecuariaTech-Service {0} iniciado. Node={1}" -f $VERSION,$Node) "INFO"
Log ("Domínio monitorado: {0}" -f $DOMAIN) "INFO"
Log ("Supabase: {0}" -f $SUPABASE_URL) "INFO"
Log "Intervalo: 300 segundos" "INFO"

while ($true) {

    Log "=== Novo ciclo Triângulo 360° ===" "INFO"

    $results = @()

    # DNS
    $dns = Test-DNS -Hostname $DOMAIN
    Log ("DNS => {0} ({1} ms) - {2}" -f $dns.status,$dns.ms,$dns.detail) $dns.status
    $results += $dns
    Push-Log $dns

    # HTTPS
    $https = Test-HTTPS -Url ("https://{0}" -f $DOMAIN)
    Log ("HTTPS => {0} ({1} ms) - {2}" -f $https.status,$https.ms,$https.detail) $https.status
    $results += $https
    Push-Log $https

    # REST
    foreach ($t in $TABLES) {
        $r = Test-REST -Table $t
        Log ("{0} => {1} ({2} ms) - {3}" -f $r.item,$r.status,$r.ms,$r.detail) $r.status
        $results += $r
        Push-Log $r
    }

    # HealthScore
    $total = $results.Count
    $oks   = ($results | Where-Object { $_.status -eq "OK" }).Count
    if ($total -gt 0) {
        $health = [math]::Round(100 * ($oks / $total), 2)
    } else { $health = 0 }

    Log ("Ciclo finalizado • HealthScore = {0}%" -f $health) "INFO"

    Update-DashboardJson -Results $results -Health $health

    Log "Aguardando 300 segundos..." "INFO"
    Start-Sleep -Seconds 300
}
