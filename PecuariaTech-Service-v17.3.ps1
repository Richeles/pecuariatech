# ============================================================
# PecuariaTech-Service v17.3 — Triângulo 360° + Painel Online
# ============================================================

$VERSION  = "v17.3"
$DOMAIN   = "www.pecuariatech.com"
$INTERVAL = 300   # segundos entre ciclos
$NODE     = $env:COMPUTERNAME

# ----------------- VARIÁVEIS SUPABASE ------------------------
if (-not $env:PECUARIA_SUPABASE_URL) {
    $url = Read-Host "Informe a URL do Supabase (ex: https://xxxx.supabase.co)"
    if (-not $url) { Write-Host "[ERRO] URL do Supabase não informada. Saindo..." -ForegroundColor Red; exit 1 }
    setx PECUARIA_SUPABASE_URL $url | Out-Null
    $env:PECUARIA_SUPABASE_URL = $url
}

$SUPABASE_URL = $env:PECUARIA_SUPABASE_URL

if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
    $key = Read-Host "Informe a SERVICE ROLE KEY do Supabase"
    if (-not $key) { Write-Host "[ERRO] Service Role Key não informada. Saindo..." -ForegroundColor Red; exit 1 }
    setx SUPABASE_SERVICE_ROLE_KEY $key | Out-Null
    $env:SUPABASE_SERVICE_ROLE_KEY = $key
}

$SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

# ----------------- TOKEN DO PAINEL ONLINE --------------------
if (-not $env:PECUARIA_TRIANGULO_TOKEN) {
    $tok = Read-Host "Informe o token secreto do painel online (PECUARIA_TRIANGULO_TOKEN)"
    if (-not $tok) { Write-Host "[AVISO] Nenhum token informado. Painel online ficará desativado." -ForegroundColor Yellow }
    else {
        setx PECUARIA_TRIANGULO_TOKEN $tok | Out-Null
        $env:PECUARIA_TRIANGULO_TOKEN = $tok
    }
}

$PANEL_TOKEN = $env:PECUARIA_TRIANGULO_TOKEN
$PANEL_URL   = "https://$DOMAIN/api/triangulo360/push"

# ----------------- CONTROLE DE LOG SUPABASE ------------------
$global:SupabaseLoggingEnabled = $true

# ----------------- FUNÇÃO DE LOG -----------------------------
function Log {
    param(
        [string]$msg,
        [string]$level = "INFO"
    )

    $time = (Get-Date).ToString("HH:mm:ss")
    $color = switch ($level) {
        "OK"   { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }

    Write-Host "[$time][$level] $msg" -ForegroundColor $color
}

# ----------------- TESTE DNS --------------------------------
function Test-DNS360 {
    param([string]$HostName)

    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        Resolve-DnsName $HostName -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item   = "DNS"
            status = "OK"
            ms     = [int]$sw.Elapsed.TotalMilliseconds
            detail = "resolvido"
        }
    } catch {
        $sw.Stop()
        return @{
            item   = "DNS"
            status = "FAIL"
            ms     = 0
            detail = "falha DNS"
        }
    }
}

# ----------------- TESTE HTTPS ------------------------------
function Test-HTTPS360 {
    param([string]$Url)

    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        $resp = Invoke-WebRequest -Uri $Url -TimeoutSec 7 -UseBasicParsing -ErrorAction Stop
        $sw.Stop()
        return @{
            item   = "HTTPS"
            status = "OK"
            ms     = [int]$sw.Elapsed.TotalMilliseconds
            detail = "$($resp.StatusCode)"
        }
    } catch {
        $sw.Stop()
        return @{
            item   = "HTTPS"
            status = "FAIL"
            ms     = 0
            detail = $_.Exception.Message
        }
    }
}

# ----------------- TESTE REST (tabelas) ---------------------
function Test-REST360 {
    param([string]$Table)

    $url = "$SUPABASE_URL/rest/v1/$Table?select=id&limit=1"
    $headers = @{
        apikey        = $SERVICE_KEY
        Authorization = "Bearer $SERVICE_KEY"
    }

    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec 7 -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{
            item   = "REST-$Table"
            status = "OK"
            ms     = [int]$sw.Elapsed.TotalMilliseconds
            detail = "consulta ok"
        }
    } catch {
        $sw.Stop()
        return @{
            item   = "REST-$Table"
            status = "FAIL"
            ms     = 0
            detail = $_.Exception.Message
        }
    }
}

# ----------------- LOG NO SUPABASE --------------------------
function Write-SupabaseLog {
    param([Hashtable]$record)

    if (-not $global:SupabaseLoggingEnabled) { return }

    $detail = $record.detail
    if ($null -ne $detail -and $detail.Length -gt 220) {
        $detail = $detail.Substring(0,220) + "..."
    }

    $payload = @(
        @{
            horario = (Get-Date).ToString("s")
            node_id = $NODE
            item    = $record.item
            status  = $record.status
            detalhe = $detail
            ms      = [int]$record.ms
            versao  = $VERSION
        }
    )

    $json = $payload | ConvertTo-Json -Depth 4

    $url = "$SUPABASE_URL/rest/v1/triangulo360_logs"
    $headers = @{
        apikey        = $SERVICE_KEY
        Authorization = "Bearer $SERVICE_KEY"
        "Content-Type" = "application/json"
        Prefer        = "return=minimal"
    }

    try {
        Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body $json -TimeoutSec 10 -ErrorAction Stop | Out-Null
        Log "Supabase log => $($record.item) [$($record.status)]" "OK"
    } catch {
        $msg = $_.Exception.Message
        Log "Falha ao registrar log no Supabase ($($record.item)): $msg" "WARN"

        # Se a tabela não existir ou der 404, desativa logging pra não ficar enchendo o saco
        if ($msg -like "*404*" -or $msg -like "*relation*does not exist*") {
            Log "Desativando Supabase logging (tabela triangulo360_logs ausente)." "WARN"
            $global:SupabaseLoggingEnabled = $false
        }
    }
}

# ----------------- PAINEL ONLINE ----------------------------
function Send-OnlinePanel {
    param([Hashtable]$cycle)

    if (-not $PANEL_TOKEN) {
        Log "Painel online desativado (token vazio)." "WARN"
        return
    }

    $json = $cycle | ConvertTo-Json -Depth 8 -Compress
    $headers = @{
        "x-triangulo-token" = $PANEL_TOKEN
        "Content-Type"      = "application/json"
    }

    $maxTries = 3
    for ($i = 1; $i -le $maxTries; $i++) {
        try {
            Invoke-RestMethod -Method Post -Uri $PANEL_URL -Headers $headers -Body $json -TimeoutSec 10 -ErrorAction Stop | Out-Null
            Log "Painel online atualizado com sucesso." "OK"
            return
        } catch {
            $msg = $_.Exception.Message
            Log "Painel falhou (tentativa $i/$maxTries): $msg" "WARN"
            Start-Sleep -Seconds (2 * $i)
        }
    }

    Log "Painel permanece offline após $maxTries tentativas." "FAIL"
}

# ----------------- DASHBOARD LOCAL (JSON + HTML) ------------
function Save-Dashboard {
    param([Hashtable]$cycle)

    $jsonPath = Join-Path (Get-Location) "triangulo360_status.json"
    $htmlPath = Join-Path (Get-Location) "triangulo360_status.html"

    $json = $cycle | ConvertTo-Json -Depth 8
    [System.IO.File]::WriteAllText($jsonPath, $json, [System.Text.Encoding]::UTF8)

    # monta linhas da tabela
    $rowsBuilder = New-Object System.Text.StringBuilder
    foreach ($r in $cycle.resultados) {
        $statusColor = if ($r.status -eq "OK") { "#22c55e" } else { "#ef4444" }
        $nullMs = if ($r.ms -gt 0) { $r.ms } else { "-" }
        [void]$rowsBuilder.AppendLine("<tr>")
        [void]$rowsBuilder.AppendLine("<td>$($r.item)</td>")
        [void]$rowsBuilder.AppendLine("<td style='color:$statusColor;font-weight:bold'>$($r.status)</td>")
        [void]$rowsBuilder.AppendLine("<td>$nullMs</td>")
        [void]$rowsBuilder.AppendLine("<td>$($r.detail)</td>")
        [void]$rowsBuilder.AppendLine("</tr>")
    }
    $rowsHtml = $rowsBuilder.ToString()

    $htmlTemplate = @'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>PecuariaTech – Triângulo 360º</title>
<style>
body{background:#020617;color:#e5e7eb;font-family:system-ui,Arial;margin:0;padding:20px;}
.card{background:#020617;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #1f2937;}
h1{margin:0 0 8px 0;font-size:24px;}
h2{margin-top:0;font-size:18px;}
.btn{display:inline-block;margin-top:12px;padding:10px 18px;border-radius:999px;background:#22c55e;color:#022c22;text-decoration:none;font-weight:bold;}
table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;}
th,td{padding:8px;border-bottom:1px solid #111827;text-align:left;}
th{background:#020617;color:#9ca3af;}
.badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;}
.badge-ok{background:#064e3b;color:#bbf7d0;}
.badge-fail{background:#7f1d1d;color:#fecaca;}
.badge-warn{background:#78350f;color:#fed7aa;}
</style>
</head>
<body>
<div class="card">
  <h1>🌾 PecuariaTech – Triângulo 360º</h1>
  <div>Versão: {0} • Node: {1} • Domínio: {2}</div>
  <div>Gerado em: {3}</div>
  <div style="margin-top:10px;font-size:32px;font-weight:bold;">HealthScore atual: {4}%</div>
  <div style="margin-top:6px;">Supabase logging: <span class="badge {7}">{6}</span></div>
  <a class="btn" href="https://{2}" target="_blank">Abrir www.pecuariatech.com</a>
</div>

<div class="card">
  <h2>Detalhes dos testes (DNS / HTTPS / REST)</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Status</th>
        <th>Tempo (ms)</th>
        <th>Detalhe</th>
      </tr>
    </thead>
    <tbody>
      {5}
    </tbody>
  </table>
</div>
</body>
</html>
'@

    $supabaseStatusText = if ($cycle.supabaseLoggingAtivo) { "Ativo" } else { "Desativado" }
    $supabaseBadgeClass = if ($cycle.supabaseLoggingAtivo) { "badge-ok" } else { "badge-warn" }

    $html = [string]::Format(
        $htmlTemplate,
        $cycle.versao,
        $cycle.node,
        $cycle.dominio,
        $cycle.horario,
        $cycle.healthScore,
        $rowsHtml,
        $supabaseStatusText,
        $supabaseBadgeClass
    )

    [System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.Encoding]::UTF8)

    Log "Dashboard JSON atualizado: $jsonPath" "OK"
    Log "Dashboard HTML atualizado: $htmlPath" "OK"
}

# ----------------- INÍCIO -----------------------------------
Write-Host "[INFO] Iniciando PecuariaTech-Service $VERSION..."
Log "Domínio monitorado: $DOMAIN"
Log "Supabase: $SUPABASE_URL"
Log "Intervalo: $INTERVAL segundos"

# ----------------- LOOP PRINCIPAL ---------------------------
while ($true) {
    Log "=== Novo ciclo Triângulo 360° ==="

    # 1) DNS
    $dns = Test-DNS360 -HostName $DOMAIN
    Log "$($dns.item) => $($dns.status) ($($dns.ms) ms) - $($dns.detail)" $dns.status
    Write-SupabaseLog $dns

    # 2) HTTPS
    $https = Test-HTTPS360 -Url ("https://$DOMAIN")
    Log "$($https.item) => $($https.status) ($($https.ms) ms) - $($https.detail)" $https.status
    Write-SupabaseLog $https

    # 3) REST para cada tabela
    $tables = @("pastagem","rebanho","financeiro","racas","dashboard")
    $restResults = @()
    foreach ($tbl in $tables) {
        $r = Test-REST360 -Table $tbl
        $restResults += $r
        Log "$($r.item) => $($r.status) ($($r.ms) ms)" $r.status
        Write-SupabaseLog $r
    }

    # 4) HEALTH SCORE
    $allResults = @($dns, $https) + $restResults
    $okCount = ($allResults | Where-Object { $_.status -eq "OK" }).Count
    $totalCount = $allResults.Count
    if ($totalCount -eq 0) { $health = 0 }
    else { $health = [math]::Round(($okCount / $totalCount) * 100, 2) }

    Log "Ciclo finalizado • HealthScore = $health %" "INFO"

    # 5) MONTA OBJETO DO CICLO
    $cycle = @{
        versao               = $VERSION
        node                 = $NODE
        dominio              = $DOMAIN
        supabaseUrl          = $SUPABASE_URL
        supabaseLoggingAtivo = $global:SupabaseLoggingEnabled
        painelUrl            = $PANEL_URL
        painelTokenConfigurado = [bool]$PANEL_TOKEN
        horario              = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        healthScore          = $health
        resultados           = $allResults
    }

    # 6) PAINEL ONLINE (não quebra se API não existir)
    Send-OnlinePanel $cycle

    # 7) DASHBOARD LOCAL
    Save-Dashboard $cycle

    Log "Aguardando $INTERVAL segundos..." "INFO"
    Start-Sleep -Seconds $INTERVAL
}
