# ===========================================================================
# PecuariaTech-Service v15.0 – Domain Dashboard
# Triângulo 360° + Supabase Logging + JSON + HTML + Link pro domínio
# Compatível com PowerShell 7.5.x
# ===========================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$VERSION      = "v15.0"
$DOMAIN       = "www.pecuariatech.com"
$BASE_PATH    = "C:\Users\Administrador\pecuariatech"
$STATUS_JSON  = Join-Path $BASE_PATH "triangulo360_status.json"
$STATUS_HTML  = Join-Path $BASE_PATH "triangulo360_status.html"
$LOG_TABLE    = "triangulo360_logs"
$INTERVAL_SEC = 300   # 5 minutos

# Tabelas REST monitoradas
$TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")

# ================== SUPABASE VARIÁVEIS ==================

$SUPABASE_URL        = $env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY_WRITE  = $env:PECUARIA_SUPABASE_KEY_WRITE

if (-not $SUPABASE_URL) {
    $SUPABASE_URL = Read-Host "Informe a URL do Supabase (ex: https://xxxx.supabase.co)"
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
        Invoke-WebRequest -Uri $Url -TimeoutSec 7 -UseBasicParsing -ErrorAction Stop | Out-Null
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
            item   = ("REST-{0}" -f $Table)
            status = "OK"
            ms     = [int]$sw.ElapsedMilliseconds
            detail = "consulta ok"
        }
    }
    catch {
        $msg = $_.Exception.Message
        if ($msg.Length -gt 200) { $msg = $msg.Substring(0,200) + "..." }
        return @{
            item   = ("REST-{0}" -f $Table)
            status = "FAIL"
            ms     = 0
            detail = $msg
        }
    }
}

# ================== LOG NO SUPABASE ==================

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

# ================== JSON PARA DASHBOARD ==================

function Update-DashboardJson {
    param($Results,[double]$Health)

    $cycle = [ordered]@{
        timestamp = (Get-Date).ToString("s")
        node      = $Node
        versao    = $VERSION
        dominio   = $DOMAIN
        health    = $Health
        results   = $Results
    }

    try {
        $cycle | ConvertTo-Json -Depth 10 | Out-File -FilePath $STATUS_JSON -Encoding UTF8
        Log ("Dashboard JSON atualizado: {0}" -f $STATUS_JSON) "OK"
    }
    catch {
        Log ("Erro ao salvar JSON do dashboard: {0}" -f $_.Exception.Message) "WARN"
    }

    return $cycle
}

# ================== HTML DO DASHBOARD ==================

function Update-DashboardHtml {
    param($Cycle)

    try {
        $json = $Cycle | ConvertTo-Json -Depth 10

        $html = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8" />
    <title>PecuariaTech – Triângulo 360°</title>
    <style>
        body{background:#020617;color:#e5e7eb;font-family:Arial,Helvetica,sans-serif;margin:0;padding:20px}
        .container{max-width:960px;margin:0 auto}
        h1{font-size:24px;margin-bottom:10px}
        h2{font-size:18px;margin-top:20px;margin-bottom:10px}
        .card{background:#0f172a;border-radius:10px;padding:15px;margin-top:10px}
        .ok{color:#22c55e;font-weight:bold}
        .fail{color:#f97316;font-weight:bold}
        .meta{font-size:12px;color:#9ca3af}
        table{width:100%;border-collapse:collapse;margin-top:10px;font-size:14px}
        th,td{padding:6px 8px;border-bottom:1px solid #1f2937;text-align:left}
        th{background:#111827}
        .btn{display:inline-block;padding:10px 16px;margin-top:10px;border-radius:8px;text-decoration:none;font-weight:bold}
        .btn-main{background:#22c55e;color:#04101c}
        .btn-main:hover{background:#16a34a}
        .pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;margin-left:5px}
        .pill-ok{background:#14532d;color:#bbf7d0}
        .pill-fail{background:#7c2d12;color:#fed7aa}
    </style>
</head>
<body>
<div class="container">
    <h1>🌾 PecuariaTech – Triângulo 360°</h1>
    <div class="meta">
        Versão: $VERSION • Node: $Node • Domínio: $DOMAIN
        <br />
        Gerado em: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
    </div>

    <div class="card">
        <h2>HealthScore atual</h2>
        <div style="font-size:32px;margin-bottom:4px;">
            <span id="health">--%</span>
        </div>
        <div id="healthLabel"></div>
        <a href="https://$DOMAIN" class="btn btn-main" target="_blank">
            Abrir www.pecuariatech.com
        </a>
    </div>

    <div class="card">
        <h2>Detalhes dos testes (DNS / HTTPS / REST)</h2>
        <table id="resultsTable">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Tempo (ms)</th>
                    <th>Detalhe</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>

<script>
const data = $json;

const healthEl = document.getElementById("health");
const healthLabelEl = document.getElementById("healthLabel");
const tableBody = document.querySelector("#resultsTable tbody");

if (data && typeof data.health === "number") {
    healthEl.textContent = data.health.toFixed(2) + "%";
    if (data.health >= 90) {
        healthLabelEl.innerHTML = '<span class="ok">Sistema saudável</span><span class="pill pill-ok">OK</span>';
    } else if (data.health >= 60) {
        healthLabelEl.innerHTML = '<span class="fail">Atenção: alguma instabilidade</span><span class="pill pill-fail">WARN</span>';
    } else {
        healthLabelEl.innerHTML = '<span class="fail">Crítico: verificar infraestrutura</span><span class="pill pill-fail">FAIL</span>';
    }
}

if (data && Array.isArray(data.results)) {
    for (const r of data.results) {
        const tr = document.createElement("tr");
        const cls = (r.status === "OK") ? "ok" : "fail";
        tr.innerHTML = `
            <td>${r.item}</td>
            <td class="${cls}">${r.status}</td>
            <td>${r.ms}</td>
            <td>${r.detail || ""}</td>
        `;
        tableBody.appendChild(tr);
    }
}
</script>
</body>
</html>
"@

        [System.IO.File]::WriteAllText($STATUS_HTML, $html, [System.Text.Encoding]::UTF8)
        Log ("Dashboard HTML atualizado: {0}" -f $STATUS_HTML) "OK"
    }
    catch {
        Log ("Erro ao salvar HTML do dashboard: {0}" -f $_.Exception.Message) "WARN"
    }
}

# ================== LOOP PRINCIPAL ==================

$firstRun = $true

Log ("📡 PecuariaTech-Service {0} iniciado. Node={1}" -f $VERSION,$Node) "INFO"
Log ("Domínio monitorado: {0}" -f $DOMAIN) "INFO"
Log ("Supabase: {0}" -f $SUPABASE_URL) "INFO"
Log ("Intervalo: {0} segundos" -f $INTERVAL_SEC) "INFO"

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
        $health = [math]::Round(100 * ($oks / $total) * 1.0, 2)
    } else {
        $health = 0
    }

    Log ("Ciclo finalizado • HealthScore = {0}%" -f $health) "INFO"

    $cycle = Update-DashboardJson -Results $results -Health $health
    Update-DashboardHtml -Cycle $cycle

    if ($firstRun) {
        $firstRun = $false
        try {
            Start-Process "https://$DOMAIN"
            Start-Process $STATUS_HTML
        } catch {
            Log "Não consegui abrir o navegador automaticamente." "WARN"
        }
    }

    Log ("Aguardando {0} segundos..." -f $INTERVAL_SEC) "INFO"
    Start-Sleep -Seconds $INTERVAL_SEC
}
