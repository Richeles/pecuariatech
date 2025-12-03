# ============================================================
# PECUARIATECH - TRIÂNGULO 360° SERVICE v17.1 (PowerShell 7+)
# DNS + HTTPS + REST + JSON + HTML + Supabase + Painel Online
# ============================================================

Clear-Host
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "[INFO] Iniciando PecuariaTech-Service v17.1..." -ForegroundColor Cyan

# ------------------------------------------------------------
# CONFIGURAÇÕES BÁSICAS
# ------------------------------------------------------------
$VERSION       = "v17.1"
$DOMAIN        = "www.pecuariatech.com"
$INTERVALO     = 300   # segundos entre ciclos
$LOG_TABLE     = "triangulo360_logs"

$BASE_PATH     = "C:\Users\Administrador\pecuariatech"
$JSON_FILE     = Join-Path $BASE_PATH "triangulo360_status.json"
$HTML_FILE     = Join-Path $BASE_PATH "triangulo360_status.html"

$TABLES        = @("pastagem","rebanho","financeiro","racas","dashboard")

if (-not (Test-Path $BASE_PATH)) {
    New-Item -ItemType Directory -Path $BASE_PATH | Out-Null
}

$Node = $env:COMPUTERNAME
if (-not $Node) { $Node = "PecuariaTechNode" }

# ------------------------------------------------------------
# SUPABASE – URL e SERVICE ROLE
# ------------------------------------------------------------
$global:SUPABASE_URL  = $env:PECUARIA_SUPABASE_URL
$global:SUPABASE_KEY  = $env:PECUARIA_SUPABASE_KEY_WRITE

if (-not $global:SUPABASE_URL) {
    $global:SUPABASE_URL = Read-Host "Informe a URL do Supabase (ex: https://xxxxx.supabase.co)"
    setx PECUARIA_SUPABASE_URL $global:SUPABASE_URL | Out-Null
}

if (-not $global:SUPABASE_KEY) {
    $global:SUPABASE_KEY = Read-Host "Informe a SERVICE ROLE KEY do Supabase"
    setx PECUARIA_SUPABASE_KEY_WRITE $global:SUPABASE_KEY | Out-Null
}

# ------------------------------------------------------------
# CONFIG – PAINEL ONLINE (/api/triangulo360/push)
# ------------------------------------------------------------
$global:ONLINE_ENDPOINT = "https://www.pecuariatech.com/api/triangulo360/push"
$global:ONLINE_TOKEN    = $env:PECUARIA_TRIANGULO_TOKEN

if (-not $global:ONLINE_TOKEN) {
    $global:ONLINE_TOKEN = Read-Host "Informe o token secreto do painel online (PECUARIA_TRIANGULO_TOKEN)"
    setx PECUARIA_TRIANGULO_TOKEN $global:ONLINE_TOKEN | Out-Null
}

$global:SupabaseLoggingEnabled = $true
$global:SupabaseFailCount      = 0
$SupabaseFailLimit             = 3

$global:OnlinePanelEnabled = $true
$global:OnlineFailCount    = 0
$OnlineFailLimit           = 3

# ------------------------------------------------------------
# FUNÇÃO: LOG COLORIDO
# ------------------------------------------------------------
function Log {
    param(
        [string]$msg,
        [string]$level = "INFO"
    )

    $color = switch ($level) {
        "OK"   { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }
    $ts = (Get-Date).ToString("HH:mm:ss")
    Write-Host "[$ts][$level] $msg" -ForegroundColor $color
}

# ------------------------------------------------------------
# TESTE DNS
# ------------------------------------------------------------
function Test-DNS360 {
    param(
        [string]$Hostname
    )

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

# ------------------------------------------------------------
# TESTE HTTPS
# ------------------------------------------------------------
function Test-HTTPS360 {
    param(
        [string]$Url
    )

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

# ------------------------------------------------------------
# TESTE REST (tabelas Supabase)
# ------------------------------------------------------------
function Test-REST360 {
    param(
        [string]$Table
    )

    $url = "{0}/rest/v1/{1}?select=*&limit=1" -f $global:SUPABASE_URL.TrimEnd("/"), $Table

    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Invoke-RestMethod -Uri $url -Headers @{
            apikey        = $global:SUPABASE_KEY
            Authorization = "Bearer $global:SUPABASE_KEY"
        } -TimeoutSec 10 -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item   = "REST-$Table"
            status = "OK"
            ms     = [int]$sw.ElapsedMilliseconds
            detail = "consulta ok"
        }
    }
    catch {
        $msg = $_.Exception.Message
        if ($msg.Length -gt 180) { $msg = $msg.Substring(0,180) + "..." }
        return @{
            item   = "REST-$Table"
            status = "FAIL"
            ms     = 0
            detail = $msg
        }
    }
}

# ------------------------------------------------------------
# ENVIAR LOG PARA SUPABASE (com correção de erro)
# ------------------------------------------------------------
function Push-SupabaseLog {
    param(
        [hashtable]$Record
    )

    if (-not $global:SupabaseLoggingEnabled) {
        return
    }

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

    $url = "{0}/rest/v1/{1}" -f $global:SUPABASE_URL.TrimEnd("/"), $LOG_TABLE

    try {
        Invoke-RestMethod -Method Post `
            -Uri $url `
            -Headers @{
                apikey        = $global:SUPABASE_KEY
                Authorization = "Bearer $global:SUPABASE_KEY"
                Prefer        = "return=minimal"
                "Content-Type"= "application/json"
            } `
            -Body ($payload | ConvertTo-Json -Depth 4) `
            -TimeoutSec 10 -ErrorAction Stop | Out-Null

        Log ("Supabase log => {0} [{1}]" -f $Record.item,$Record.status) "OK"
        $global:SupabaseFailCount = 0
    }
    catch {
        $global:SupabaseFailCount++
        Log ("Supabase log FALHOU ({0}): {1}" -f $Record.item, $_.Exception.Message) "WARN"

        if ($global:SupabaseFailCount -ge $SupabaseFailLimit) {
            $global:SupabaseLoggingEnabled = $false
            Log "Supabase logging desativado (falhas consecutivas). Triângulo 360° continua apenas local." "WARN"
        }
    }
}

# ------------------------------------------------------------
# ENVIAR PAINEL PARA ENDPOINT ONLINE
# ------------------------------------------------------------
function Send-OnlinePanel {
    param(
        $Cycle
    )

    if (-not $global:OnlinePanelEnabled) {
        return
    }

    $body = $Cycle | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Method Post `
            -Uri $global:ONLINE_ENDPOINT `
            -Headers @{
                "Content-Type"     = "application/json"
                "X-Triangulo-Token"= $global:ONLINE_TOKEN
            } `
            -Body $body `
            -TimeoutSec 10 -ErrorAction Stop | Out-Null

        Log "Painel online atualizado com sucesso." "OK"
        $global:OnlineFailCount = 0
    }
    catch {
        $global:OnlineFailCount++
        Log ("Falha ao enviar painel online: {0}" -f $_.Exception.Message) "WARN"

        if ($global:OnlineFailCount -ge $OnlineFailLimit) {
            $global:OnlinePanelEnabled = $false
            Log "Envio para painel online desativado (falhas consecutivas). Painel local continua." "WARN"
        }
    }
}

# ------------------------------------------------------------
# DASHBOARD: JSON
# ------------------------------------------------------------
function Update-DashboardJson {
    param(
        [array]$Results,
        [double]$Health
    )

    $supabaseStatus = if ($global:SupabaseLoggingEnabled) { "ON" } else { "OFF" }
    $onlineStatus   = if ($global:OnlinePanelEnabled) { "ON" } else { "OFF" }

    $cycle = [ordered]@{
        timestamp        = (Get-Date).ToString("s")
        versao           = $VERSION
        node             = $Node
        dominio          = $DOMAIN
        health           = $Health
        supabase_logging = $supabaseStatus
        online_panel     = $onlineStatus
        results          = $Results
    }

    try {
        $cycle | ConvertTo-Json -Depth 10 | Out-File -FilePath $JSON_FILE -Encoding UTF8
        Log ("Dashboard JSON atualizado: {0}" -f $JSON_FILE) "OK"
    }
    catch {
        Log ("Erro ao salvar JSON: {0}" -f $_.Exception.Message) "WARN"
    }

    return $cycle
}

# ------------------------------------------------------------
# DASHBOARD: HTML
# ------------------------------------------------------------
function Update-DashboardHtml {
    param(
        $Cycle
    )

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
h2{font-size:18px;margin:15px 0 8px}
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
.pill-on{background:#14532d;color:#bbf7d0}
.pill-off{background:#7c2d12;color:#fed7aa}
</style>
</head>
<body>
<div class="container">
  <h1>🌾 PecuariaTech – Triângulo 360°</h1>
  <div class="meta">
    Versão: $VERSION • Node: $Node • Domínio: $DOMAIN<br/>
    Gerado em: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
  </div>

  <div class="card">
    <h2>HealthScore atual</h2>
    <div style="font-size:32px;margin-bottom:4px;">
      <span id="health">--%</span>
    </div>
    <div id="healthLabel"></div>
    <div style="margin-top:8px;font-size:12px;">
      Supabase logging:
      <span id="supabaseStatus"></span><br/>
      Painel online:
      <span id="onlineStatus"></span>
    </div>
    <a href="https://$DOMAIN" class="btn btn-main" target="_blank">
      Abrir $DOMAIN
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
const supaEl = document.getElementById("supabaseStatus");
const onlineEl = document.getElementById("onlineStatus");
const tableBody = document.querySelector("#resultsTable tbody");

if (data && typeof data.health === "number") {
  healthEl.textContent = data.health.toFixed(2) + "%";
  if (data.health >= 90) {
    healthLabelEl.innerHTML = '<span class="ok">Sistema saudável</span>';
  } else if (data.health >= 60) {
    healthLabelEl.innerHTML = '<span class="fail">Atenção: alguma instabilidade</span>';
  } else {
    healthLabelEl.innerHTML = '<span class="fail">Crítico: verificar infraestrutura</span>';
  }
} else {
  healthEl.textContent = "--%";
  healthLabelEl.textContent = "Sem dados suficientes ainda.";
}

if (data && data.supabase_logging) {
  if (data.supabase_logging === "ON") {
    supaEl.innerHTML = '<span class="pill pill-on">ON</span>';
  } else {
    supaEl.innerHTML = '<span class="pill pill-off">OFF</span>';
  }
}

if (data && data.online_panel) {
  if (data.online_panel === "ON") {
    onlineEl.innerHTML = '<span class="pill pill-on">ON</span>';
  } else {
    onlineEl.innerHTML = '<span class="pill pill-off">OFF</span>';
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

        [System.IO.File]::WriteAllText($HTML_FILE, $html, [System.Text.Encoding]::UTF8)
        Log ("Dashboard HTML atualizado: {0}" -f $HTML_FILE) "OK"
    }
    catch {
        Log ("Erro ao salvar HTML: {0}" -f $_.Exception.Message) "WARN"
    }
}

# ------------------------------------------------------------
# LOOP PRINCIPAL – TRIÂNGULO 360°
# ------------------------------------------------------------
Log ("Domínio monitorado: {0}" -f $DOMAIN) "INFO"
Log ("Supabase: {0}" -f $global:SUPABASE_URL) "INFO"
Log ("Endpoint painel online: {0}" -f $global:ONLINE_ENDPOINT) "INFO"
Log ("Intervalo: {0} segundos" -f $INTERVALO) "INFO"

$firstRun = $true

while ($true) {

    Log "=== Novo ciclo Triângulo 360° ===" "INFO"

    $results = @()

    # DNS
    $dns = Test-DNS360 -Hostname $DOMAIN
    Log ("DNS => {0} ({1} ms) - {2}" -f $dns.status,$dns.ms,$dns.detail) $dns.status
    $results += $dns
    Push-SupabaseLog $dns

    # HTTPS
    $https = Test-HTTPS360 -Url ("https://{0}" -f $DOMAIN)
    Log ("HTTPS => {0} ({1} ms) - {2}" -f $https.status,$https.ms,$https.detail) $https.status
    $results += $https
    Push-SupabaseLog $https

    # REST
    foreach ($t in $TABLES) {
        $r = Test-REST360 -Table $t
        Log ("{0} => {1} ({2} ms) - {3}" -f $r.item,$r.status,$r.ms,$r.detail) $r.status
        $results += $r
        Push-SupabaseLog $r
    }

    # HealthScore
    $total = $results.Count
    $oks   = ($results | Where-Object { $_.status -eq "OK" }).Count
    if ($total -gt 0) {
        $health = [math]::Round(100 * ($oks / $total), 2)
    } else { $health = 0 }

    Log ("Ciclo finalizado • HealthScore = {0}%" -f $health) "INFO"

    $cycle = Update-DashboardJson -Results $results -Health $health
    Update-DashboardHtml -Cycle $cycle
    Send-OnlinePanel -Cycle $cycle

    if ($firstRun) {
        $firstRun = $false
        try { Start-Process $HTML_FILE } catch {}
    }

    Log ("Aguardando {0} segundos..." -f $INTERVALO) "INFO"
    Start-Sleep -Seconds $INTERVALO
}
