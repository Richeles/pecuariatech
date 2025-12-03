<#
 🌾 PecuariaTech-Service v9.1 — Triângulo 360º
 Script único: DNS + HTTPS + REST + HTML + Logs
#>

# =====================================
# VARIÁVEIS DO PROJETO
# =====================================

$env:SUPABASE_URL = "https://girkgszyajljunwsnwav.supabase.co"
$env:SUPABASE_PROJECT_REF = "girkgszyajljunwsnwav"
$env:SUPABASE_SERVICE_ROLE_KEY = "COLE_A_SERVICE_ROLE_KEY_AQUI"

# Caminhos fixos
$BASE  = "C:\Users\Administrador\pecuariatech"
$LOGS  = Join-Path $BASE "logs"
$ARCH  = Join-Path $LOGS "archive"
$CSV   = Join-Path $LOGS "status_triangulo360.csv"
$HTML  = Join-Path $LOGS "status_triangulo360.html"

# Garantir pastas
foreach ($p in @($LOGS,$ARCH)) {
    if (!(Test-Path $p)) {
        New-Item -ItemType Directory -Force -Path $p | Out-Null
    }
}

function Say($msg,$color="White") { Write-Host $msg -ForegroundColor $color }

# Criar CSV inicial se não existir
if (!(Test-Path $CSV)) {
    "time;item;status;detail;ms" | Out-File $CSV
}

# =====================================
# FUNÇÃO DE LOG
# =====================================

function Log($item,$status,$detail,$ms){
    $detail = $detail -replace ";",","   # remover ; que quebra CSV
    $line = "{0};{1};{2};{3};{4}" -f (Get-Date -Format "s"),$item,$status,$detail,$ms
    Add-Content -Path $CSV -Value $line
}

# =====================================
# TESTE DNS
# =====================================

function Test-DNS {
    Say "🔵 [DNS] Verificando domínio..." Cyan
    try {
        Resolve-DnsName "pecuariatech.com" | Out-Null
        Resolve-DnsName "www.pecuariatech.com" | Out-Null
        Say "✅ DNS OK" Green
        Log "DNS" "OK" "OK" 0
    } catch {
        Say "❌ DNS Falhou" Red
        Log "DNS" "FALHA" $_.Exception.Message 0
    }
}

# =====================================
# TESTE HTTPS
# =====================================

function Test-HTTPS {
    $url = "https://www.pecuariatech.com"
    Say "🟣 [HTTPS] Testando $url..." Magenta

    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        $r = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
        $sw.Stop()
        Say "✅ HTTPS OK ($([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms)" Green
        Log "HTTPS" "OK" $r.StatusCode $sw.Elapsed.TotalMilliseconds
    } catch {
        $sw.Stop()
        Say "❌ HTTPS Falhou" Red
        Log "HTTPS" "FALHA" $_.Exception.Message $sw.Elapsed.TotalMilliseconds
    }
}

# =====================================
# TESTE REST SUPABASE
# =====================================

function Test-REST($table){
    $url = "$($env:SUPABASE_URL)/rest/v1/$table?limit=1"
    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-RestMethod -Uri $url -Headers @{
            apikey       = $env:SUPABASE_SERVICE_ROLE_KEY
            Authorization = "Bearer $env:SUPABASE_SERVICE_ROLE_KEY"
        } -TimeoutSec 10 | Out-Null

        $sw.Stop()
        Say "🟢 $table OK ($([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms)" Green
        Log "REST_$table" "OK" "200" $sw.Elapsed.TotalMilliseconds

    } catch {
        $sw.Stop()
        Say "🔴 $table FALHOU ($([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms)" Red
        Log "REST_$table" "FALHA" $_.Exception.Message $sw.Elapsed.TotalMilliseconds
    }
}

# =====================================
# GERAR HTML (CORRIGIDO)
# =====================================

function Generate-HTML {

    $raw = Get-Content $CSV | Select-Object -Skip 1

    # Corrigir parse de ms
    $data = @()
    foreach ($r in $raw) {
        $parts = $r.Split(";")
        if ($parts.Count -lt 5) { continue }

        # corrigir conversão MS
        $msParsed = 0
        [double]::TryParse($parts[4], [ref]$msParsed) | Out-Null

        $obj = [PSCustomObject]@{
            time   = $parts[0]
            item   = $parts[1]
            status = $parts[2]
            detail = $parts[3]
            ms     = $msParsed
        }
        $data += $obj
    }

    $json = $data | ConvertTo-Json -Compress

    # HTML final corrigido
    $html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'>
<title>PecuariaTech — Triângulo360</title>
<script src='https://cdn.plot.ly/plotly-2.27.0.min.js'></script>
<style>
body { background:#0f172a;color:#eee;font-family:Arial;text-align:center }
.card { background:#111c40;padding:10px;margin:8px;border-radius:10px }
</style>
</head>
<body>

<h2>🌾 PecuariaTech — Triângulo 360º</h2>
<div id="pyramid" class="card"></div>

<script>
const data = $json;

// Contagem de falhas
const fails = {};
data.forEach(d => {
    if (d.status === "FALHA") {
        fails[d.item] = (fails[d.item] || 0) + 1;
    }
});

// Monta pirâmide
Plotly.newPlot("pyramid", [{
    x: Object.values(fails),
    y: Object.keys(fails),
    type: "bar",
    orientation: "h"
}], { title: "Falhas do Sistema" });

</script>

</body>
</html>
"@

    [IO.File]::WriteAllText($HTML, $html, [Text.Encoding]::UTF8)
    Say "📊 Painel HTML atualizado → $HTML" Green
}

# =====================================
# EXECUÇÃO DO TRIÂNGULO 360º
# =====================================

Say "`n================ Triângulo 360° — Ciclo às $(Get-Date -Format 'HH:mm:ss') ================" Yellow

Test-DNS
Test-HTTPS

$tables = @("pastagem","rebanho","financeiro","racas","dashboard")
foreach ($t in $tables) {
    Test-REST $t
}

Generate-HTML

Say "🔺 Triângulo 360º completo — painel pronto." Cyan
