# ============================================================
# PECUARIATECH - TRIÂNGULO 360° SERVICE v16.1 (PowerShell 7+)
# ============================================================

Clear-Host
Write-Host "[INFO] Iniciando PecuariaTech-Service v16.1..." -ForegroundColor Cyan

# ------------------------------------------------------------
# CONFIGURAÇÕES DO USUÁRIO
# ------------------------------------------------------------

$DOMAIN     = "www.pecuariatech.com"
$SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"
$INTERVALO   = 300   # segundos

# ------------------------------------------------------------
# Solicita SERVICE ROLE KEY
# ------------------------------------------------------------
if (-not $env:SUPABASE_SERVICE_ROLE) {
    $env:SUPABASE_SERVICE_ROLE = Read-Host "Informe a SERVICE ROLE KEY do Supabase"
}

# ------------------------------------------------------------
# Função: Registrar Log no Supabase
# ------------------------------------------------------------
function Log-Supabase {
    param($event, $status, $ms, $detail)

    try {
        $url = "$SUPABASE_URL/rest/v1/triangulo360_logs"

        $body = @{
            evento     = $event
            status     = $status
            tempo_ms   = [int]$ms
            detalhe    = $detail
            node_id    = $env:COMPUTERNAME
            timestamp  = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        }

        $wrapper = @{ records = @($body) }

        Invoke-RestMethod -Method POST `
            -Uri $url `
            -Headers @{
                apikey       = $env:SUPABASE_SERVICE_ROLE
                Authorization = "Bearer $env:SUPABASE_SERVICE_ROLE"
                Prefer = "return=minimal"
            } `
            -Body ($wrapper | ConvertTo-Json -Depth 6)

        Write-Host "[INFO] Supabase log => $event [$status]" -ForegroundColor Green
    }
    catch {
        Write-Host "[WARN] Falha ao registrar log no Supabase ($event)" -ForegroundColor Yellow
    }
}

# ------------------------------------------------------------
# Função: Teste DNS
# ------------------------------------------------------------
function Test-DNS360 {
    param($hostname)

    try {
        $inicio = Get-Date
        $res = Resolve-DnsName -Name $hostname -ErrorAction Stop
        $ms = ((Get-Date) - $inicio).TotalMilliseconds

        return @{ status="OK"; ms=$ms; detail=$res.IPAddress }
    }
    catch {
        return @{ status="FAIL"; ms=0; detail="DNS não resolveu" }
    }
}

# ------------------------------------------------------------
# Função: Teste HTTPS
# ------------------------------------------------------------
function Test-HTTPS360 {
    param($url)

    try {
        $inicio = Get-Date
        $req = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
        $ms = ((Get-Date) - $inicio).TotalMilliseconds

        return @{ status="OK"; ms=$ms; detail=$req.StatusCode }
    }
    catch {
        return @{ status="FAIL"; ms=0; detail=$_.Exception.Message }
    }
}

# ------------------------------------------------------------
# Função: Teste REST Supabase
# ------------------------------------------------------------
function Test-REST360 {
    param($table)

    try {
        $url = "$SUPABASE_URL/rest/v1/$table?select=id&limit=1"

        $inicio = Get-Date
        Invoke-RestMethod -Uri $url -Headers @{
            apikey       = $env:SUPABASE_SERVICE_ROLE
            Authorization = "Bearer $env:SUPABASE_SERVICE_ROLE"
        } -TimeoutSec 5

        $ms = ((Get-Date) - $inicio).TotalMilliseconds

        return @{ status="OK"; ms=$ms; detail="consulta ok" }
    }
    catch {
        return @{ status="FAIL"; ms=0; detail="tabela ou RLS não permite SELECT" }
    }
}

# ------------------------------------------------------------
# Função: Gerar Dashboard (JSON e HTML)
# ------------------------------------------------------------
function Gerar-Dashboard {
    param($dados)

    $json = $dados | ConvertTo-Json -Depth 6
    $json | Out-File -Encoding utf8 "triangulo360_status.json"

    Write-Host "[OK] Dashboard JSON atualizado: triangulo360_status.json" -ForegroundColor Green

    # HTML bonito
    $html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>PecuariaTech – Triângulo 360°</title>
<style>
body { background:#0b0f1a; color:white; font-family:Arial; padding:30px; }
.card { background:#111625; padding:20px; border-radius:10px; margin-bottom:20px; }
.ok { color:#33ff77; }
.fail { color:#ff5566; }
.btn {
    background:#33cc66; padding:15px; color:black; border-radius:8px;
    display:inline-block; font-size:22px; text-decoration:none; font-weight:bold;
}
</style>
</head>
<body>

<h1>🌿 PecuariaTech – Triângulo 360°</h1>
<p><b>Versão:</b> v16.1 • <b>Node:</b> $env:COMPUTERNAME • <b>Domínio:</b> $DOMAIN<br>
Gerado em: $(Get-Date)</p>

<div class="card">
<h2>HealthScore atual</h2>
<h1>${($dados.healthscore)}%</h1>
<a class="btn" href="https://$DOMAIN" target="_blank">Abrir $DOMAIN</a>
</div>

<div class="card">
<h2>Detalhes dos testes</h2>
<table width="100%">
<tr><th>Item</th><th>Status</th><th>Tempo(ms)</th><th>Detalhe</th></tr>
"@

    foreach ($t in $dados.testes) {
        $cor = if ($t.status -eq "OK") { "ok" } else { "fail" }
        $html += "<tr><td>$($t.item)</td><td class='$cor'>$($t.status)</td><td>$($t.ms)</td><td>$($t.detail)</td></tr>"
    }

$html += @"
</table>
</div>

</body>
</html>
"@

    $html | Out-File -Encoding utf8 "triangulo360_status.html"

    Write-Host "[OK] Dashboard HTML atualizado: triangulo360_status.html" -ForegroundColor Green
}

# ------------------------------------------------------------
# LOOP PRINCIPAL
# ------------------------------------------------------------
while ($true) {

    Write-Host ""
    Write-Host "[INFO] === Novo ciclo Triângulo 360° ===" -ForegroundColor Cyan

    $dns   = Test-DNS360 -hostname $DOMAIN
    $https = Test-HTTPS360 -url "https://$DOMAIN"

    $pastagem   = Test-REST360 -table "pastagem"
    $rebanho    = Test-REST360 -table "rebanho"
    $financeiro = Test-REST360 -table "financeiro"
    $racas      = Test-REST360 -table "racas"
    $dashboard  = Test-REST360 -table "dashboard"

    # Registrar no Supabase
    Log-Supabase "DNS"        $dns.status        $dns.ms        $dns.detail
    Log-Supabase "HTTPS"      $https.status      $https.ms      $https.detail
    Log-Supabase "pastagem"   $pastagem.status   $pastagem.ms   $pastagem.detail
    Log-Supabase "rebanho"    $rebanho.status    $rebanho.ms    $rebanho.detail
    Log-Supabase "financeiro" $financeiro.status $financeiro.ms $financeiro.detail
    Log-Supabase "racas"      $racas.status      $racas.ms      $racas.detail
    Log-Supabase "dashboard"  $dashboard.status  $dashboard.ms  $dashboard.detail

    $testes = @(
        @{ item="DNS";        status=$dns.status;        ms=$dns.ms;        detail=$dns.detail }
        @{ item="HTTPS";      status=$https.status;      ms=$https.ms;      detail=$https.detail }
        @{ item="pastagem";   status=$pastagem.status;   ms=$pastagem.ms;   detail=$pastagem.detail }
        @{ item="rebanho";    status=$rebanho.status;    ms=$rebanho.ms;    detail=$rebanho.detail }
        @{ item="financeiro"; status=$financeiro.status; ms=$financeiro.ms; detail=$financeiro.detail }
        @{ item="racas";      status=$racas.status;      ms=$racas.ms;      detail=$racas.detail }
        @{ item="dashboard";  status=$dashboard.status;  ms=$dashboard.ms;  detail=$dashboard.detail }
    )

    $ok = ($testes | Where-Object { $_.status -eq "OK" }).Count
    $score = [math]::Round(($ok / $testes.Count) * 100, 2)

    $dados = @{
        healthscore = $score
        timestamp = (Get-Date)
        testes = $testes
    }

    Gerar-Dashboard $dados

    Write-Host "[INFO] Ciclo finalizado • HealthScore = $score %" -ForegroundColor Cyan
    Write-Host "[INFO] Aguardando $INTERVALO segundos..."
    Start-Sleep -Seconds $INTERVALO
}
