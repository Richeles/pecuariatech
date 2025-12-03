<# ===========================================================
   PecuariaTech – Triângulo 360°
   v16.0 — Script Único PowerShell
   Autor: Richeles + IA 🐂💚
   ===========================================================
#>

Clear-Host
Write-Host "`n[INFO] Iniciando PecuariaTech-Service v16.0..." -ForegroundColor Cyan

# ================================
# CONFIGURAÇÕES DO SISTEMA
# ================================
$DOMAIN = "www.pecuariatech.com"
$SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"

# solicita service_role apenas uma vez
$SERVICE_ROLE = Read-Host "Informe a SERVICE ROLE KEY do Supabase"

$INTERVALO = 300   # segundos
$NODE = $env:COMPUTERNAME
$VERSAO = "v16.0"

# arquivos locais
$JSON_FILE = "triangulo360_status.json"
$HTML_FILE = "triangulo360_status.html"


# ================================
# FUNÇÃO – LOG LOCAL E COLORIDO
# ================================
function Log {
    param($msg, $type="INFO")
    $time = Get-Date -Format "HH:mm:ss"
    switch ($type) {
        "INFO" { $color = "Cyan" }
        "OK"   { $color = "Green" }
        "FAIL" { $color = "Red" }
        "WARN" { $color = "Yellow" }
        default { $color = "White" }
    }
    Write-Host "[$time][$type] $msg" -ForegroundColor $color
}


# ================================
# FUNÇÃO – TESTE DNS
# ================================
function Test-DNS360 {
    param($host)

    try {
        $inicio = Get-Date
        $res = Resolve-DnsName -Name $host -ErrorAction Stop
        $ms = ((Get-Date) - $inicio).TotalMilliseconds
        return @{ status="OK"; ms=$ms; detail=$res.IPAddress }
    }
    catch {
        return @{ status="FAIL"; ms=0; detail="DNS não resolveu" }
    }
}


# ================================
# FUNÇÃO – TESTE HTTPS
# ================================
function Test-HTTPS360 {
    param($url)

    try {
        $inicio = Get-Date
        $r = Invoke-WebRequest -Uri "https://$url" -Method GET -TimeoutSec 10 -ErrorAction Stop
        $ms = ((Get-Date) - $inicio).TotalMilliseconds
        return @{ status="OK"; ms=$ms; detail=$r.StatusCode }
    }
    catch {
        return @{ status="FAIL"; ms=0; detail="HTTPS falhou" }
    }
}


# ================================
# FUNÇÃO – TESTE REST SUPABASE
# ================================
function Test-REST360 {
    param($table)

    try {
        $url = "$SUPABASE_URL/rest/v1/$table?limit=1"
        $inicio = Get-Date

        $r = Invoke-RestMethod -Uri $url -Headers @{ apikey=$SERVICE_ROLE; Authorization="Bearer $SERVICE_ROLE" } -Method GET

        $ms = ((Get-Date) - $inicio).TotalMilliseconds
        return @{ status="OK"; ms=$ms; detail="Consulta ok" }
    }
    catch {
        return @{ status="FAIL"; ms=0; detail="Tabela inacessível" }
    }
}


# ================================
# REGISTRO NO SUPABASE
# ================================
function Insert-SupaLog {
    param($item,$status,$ms,$detail)

    try {
        $body = @{
            node_id = $NODE
            horario = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            item = $item
            status = $status
            ms = $ms
            detalhe = $detail
            versao = $VERSAO
        }

        Invoke-RestMethod `
            -Uri "$SUPABASE_URL/rest/v1/triangulo360_logs" `
            -Headers @{ apikey=$SERVICE_ROLE; Authorization="Bearer $SERVICE_ROLE"; Prefer="return=minimal" } `
            -Method POST `
            -Body ($body | ConvertTo-Json) `
            -ContentType "application/json"
    }
    catch {
        Log "Falha ao registrar log no Supabase ($item)" "WARN"
    }
}


# ================================
# GERA DASHBOARD LOCAL (JSON + HTML)
# ================================
function Save-Dashboard {
    param($resultados,$health)

    $json = @{
        gerado_em = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        versao = $VERSAO
        node = $NODE
        dominio = $DOMAIN
        healthscore = $health
        resultados = $resultados
    } | ConvertTo-Json -Depth 6

    $json | Out-File $JSON_FILE -Encoding UTF8
    Log "Dashboard JSON atualizado: $JSON_FILE" "OK"

    # HTML visual
    $html = @"
<!DOCTYPE html><html lang="pt-br"><head>
<meta charset="UTF-8"><title>PecuariaTech – Triângulo 360°</title>
<style>
body { background:#0d1117; color:#fff; font-family:Arial; padding:20px; }
.box { background:#161b22; padding:20px; border-radius:12px; margin-bottom:20px; }
.ok { color:#4ade80; } .fail { color:#f87171; }
.table { width:100%; border-collapse:collapse; }
.table th { background:#1e2633; padding:8px; text-align:left; }
.table td { padding:8px; border-bottom:1px solid #2a3444; }
</style></head><body>
<h2>🌾 PecuariaTech – Triângulo 360°</h2>
<p>Versão: $VERSAO • Node: $NODE • Domínio: $DOMAIN</p>

<div class='box'>
<h3>HealthScore atual: <span style="color:#4ade80">$health %</span></h3>
<a href="https://$DOMAIN" style="background:#22c55e;padding:10px 25px;border-radius:8px;color:#000;text-decoration:none;font-weight:bold">Abrir $DOMAIN</a>
</div>

<div class='box'>
<h3>Resultados</h3>
<table class="table">
<tr><th>Item</th><th>Status</th><th>Tempo (ms)</th><th>Detalhe</th></tr>
"@

    foreach ($r in $resultados) {
        $cls = if ($r.status -eq "OK") { "ok" } else { "fail" }
        $html += "<tr><td>$($r.item)</td><td class='$cls'>$($r.status)</td><td>$($r.ms)</td><td>$($r.detail)</td></tr>"
    }

    $html += "</table></div></body></html>"

    $html | Out-File $HTML_FILE -Encoding UTF8
    Log "Dashboard HTML atualizado: $HTML_FILE" "OK"
}


# ================================
# LOOP INFINITO DO TRIÂNGULO 360°
# ================================
while ($true) {

    Log "=== Novo ciclo Triângulo 360° ===" "INFO"

    $resultados = @()

    # DNS ------------------------------------
    $dns = Test-DNS360 -host $DOMAIN
    Log "DNS => $($dns.status) ($($dns.ms) ms) - $($dns.detail)" $dns.status
    Insert-SupaLog "DNS" $dns.status $dns.ms $dns.detail
    $resultados += @{ item="DNS"; status=$dns.status; ms=$dns.ms; detail=$dns.detail }

    # HTTPS ----------------------------------
    $https = Test-HTTPS360 -url $DOMAIN
    Log "HTTPS => $($https.status) ($($https.ms) ms) - $($https.detail)" $https.status
    Insert-SupaLog "HTTPS" $https.status $https.ms $https.detail
    $resultados += @{ item="HTTPS"; status=$https.status; ms=$https.ms; detail=$https.detail }

    # REST Tabelas ---------------------------
    $tabelas = "pastagem","rebanho","financeiro","racas","dashboard"

    foreach ($t in $tabelas) {
        $r = Test-REST360 -table $t
        Log "REST-$t => $($r.status) ($($r.ms) ms)" $r.status
        Insert-SupaLog "REST-$t" $r.status $r.ms $r.detail
        $resultados += @{ item="REST-$t"; status=$r.status; ms=$r.ms; detail=$r.detail }
    }

    # cálculo do HealthScore
    $oks = ($resultados | Where-Object { $_.status -eq "OK" }).Count
    $total = $resultados.Count
    $health = [Math]::Round(($oks / $total) * 100, 2)

    Log "Ciclo finalizado • HealthScore = $health %" "INFO"

    Save-Dashboard -resultados $resultados -health $health

    Log "Aguardando $INTERVALO segundos..." "INFO"
    Start-Sleep -Seconds $INTERVALO
}
