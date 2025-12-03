<#
 🌾 PecuariaTech-Service v9.3 — Triângulo 360º
 - Testa DNS, HTTPS e REST (Supabase)
 - Gera CSV de logs
 - Gera HTML com pirâmide de falhas (Plotly)
 - Corrige bug antigo de WriteAllText (caminho x conteúdo)
#>

param(
  [switch]$Loop,
  [int]$IntervaloMin = 10
)

# ============ CONFIG PROJETO ============

# ⚠️ Você já me passou esses dados. Se trocar o projeto, é só mudar aqui:
$env:SUPABASE_URL              = "https://kpzzekflqpoeccnqfkng.supabase.co"
$env:SUPABASE_PROJECT_REF      = "kpzzekflqpoeccnqfkng"
$env:SUPABASE_ANON_KEY         = "sb_publishable_24L7SRlrwKIXoNXMgg-QIQ_DbgOZTmg"
$env:SUPABASE_SERVICE_ROLE_KEY = "sb_secret_jn8Mqxvg8og0ykdICh-LMg_Xp1E0HBZ"

# Caminhos fixos (pra não cair em C:\Program Files\PowerShell\7)
$BASE = "C:\Users\Administrador\pecuariatech"
$LOGS = Join-Path $BASE "logs"
$ARCH = Join-Path $LOGS "archive"
$CSV  = Join-Path $LOGS "status_triangulo360.csv"
$HTML = Join-Path $LOGS "status_triangulo360.html"

$TABLES = @("pastagem","rebanho","financeiro","racas","dashboard")

# ============ PREPARE PASTAS & LOGS ============

foreach ($p in @($LOGS,$ARCH)) {
    if (!(Test-Path $p)) {
        New-Item -ItemType Directory -Force -Path $p | Out-Null
    }
}

function Say($msg, $color = "White") {
    Write-Host $msg -ForegroundColor $color
}

# Cabeçalho CSV
if (!(Test-Path $CSV)) {
    "time;item;status;detail;ms" | Out-File -FilePath $CSV -Encoding UTF8
}

# Compacta logs antigos (só CSV) pra não virar bagunça
if (Get-ChildItem $LOGS -Filter *.csv | Where-Object { $_.Name -ne (Split-Path $CSV -Leaf) }) {
    $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $zip = Join-Path $ARCH "triangulo360_$stamp.zip"
    Get-ChildItem $LOGS -Filter *.csv | Compress-Archive -DestinationPath $zip -Force
    Say "📦 Logs compactados → $zip" Yellow
}

function Log-Line($item,$status,$detail,$ms) {
    $line = "{0};{1};{2};{3};{4}" -f (Get-Date -Format "s"), $item, $status, ($detail -replace "`n"," " -replace ";",","), [math]::Round($ms,3)
    Add-Content -Path $CSV -Value $line
}

# ============ TESTES TRIÂNGULO 360º ============

function Test-DNS {
    Say "🔵 [DNS] Verificando domínio..." Cyan
    try {
        Resolve-DnsName "pecuariatech.com" -ErrorAction Stop | Out-Null
        Resolve-DnsName "www.pecuariatech.com" -ErrorAction Stop | Out-Null
        Say "✅ DNS OK" Green
        Log-Line "DNS" "OK" "resolvido" 0
    } catch {
        Say "❌ DNS Falhou: $($_.Exception.Message)" Red
        Log-Line "DNS" "FALHA" $_.Exception.Message 0
    }
}

function Test-HTTPS {
    $url = "https://www.pecuariatech.com"
    Say "🟣 [HTTPS] Testando $url..." Magenta
    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        $r = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
        $sw.Stop()
        Say ("✅ HTTPS OK ({0} ms)" -f [math]::Round($sw.Elapsed.TotalMilliseconds,2)) Green
        Log-Line "HTTPS" "OK" ($r.StatusCode.ToString()) $sw.Elapsed.TotalMilliseconds
    } catch {
        $sw.Stop()
        Say ("❌ HTTPS Falhou ({0} ms)" -f [math]::Round($sw.Elapsed.TotalMilliseconds,2)) Red
        Log-Line "HTTPS" "FALHA" $_.Exception.Message $sw.Elapsed.TotalMilliseconds
    }
}

function Test-REST($table) {
    $url = "$($env:SUPABASE_URL)/rest/v1/$table?select=id&limit=1"
    $sw  = [Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-RestMethod -Uri $url -Headers @{
            apikey       = $env:SUPABASE_SERVICE_ROLE_KEY
            Authorization = "Bearer $($env:SUPABASE_SERVICE_ROLE_KEY)"
        } -TimeoutSec 10 -ErrorAction Stop | Out-Null

        $sw.Stop()
        $ms = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
        Say "🟢 $table OK (${ms} ms)" Green
        Log-Line "REST_$table" "OK" "200" $ms
    } catch {
        $sw.Stop()
        $ms = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
        Say "🔴 $table FALHOU (${ms} ms)" Red
        Log-Line "REST_$table" "FALHA" $_.Exception.Message $ms
    }
}

# ============ GERA HTML (SEM BUG) ============

function Generate-HTML {
    # garante pasta do HTML
    $htmlDir = Split-Path $HTML
    if (!(Test-Path $htmlDir)) {
        New-Item -ItemType Directory -Force -Path $htmlDir | Out-Null
    }

    # carrega CSV e monta objetos
    $lines = Get-Content $CSV | Select-Object -Skip 1
    $data = @()

    foreach ($ln in $lines) {
        if (-not $ln) { continue }
        $parts = $ln -split ';', 5
        if ($parts.Count -lt 5) { continue }

        $msVal = 0.0
        [double]::TryParse($parts[4], [ref]$msVal) | Out-Null

        $data += [PSCustomObject]@{
            time   = $parts[0]
            item   = $parts[1]
            status = $parts[2]
            detail = $parts[3]
            ms     = $msVal
        }
    }

    # transforma em JSON pra ficar limpinho no JS
    $json = if ($data.Count -gt 0) { $data | ConvertTo-Json -Compress } else { "[]" }

    # HTML com Plotly – repare que NÃO tem $variáveis no JS (só $json do PowerShell)
    $html = @"
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PecuariaTech — Triângulo360</title>
  <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
  <style>
    body { background:#0f172a;color:#eee;font-family:Arial;text-align:center; margin:0; padding:10px }
    .card { background:#111c40;padding:10px;margin:8px;border-radius:10px }
  </style>
</head>
<body>

<h2>🌾 PecuariaTech — Triângulo 360º</h2>
<div id="pyramid" class="card"></div>

<script>
  // dados vindos do PowerShell (JSON)
  const data = $json;

  // monta contagem de falhas por item
  const fails = {};
  for (const row of data) {
    if (row.status === "FALHA") {
      fails[row.item] = (fails[row.item] || 0) + 1;
    }
  }

  const labels = Object.keys(fails);
  const values = Object.values(fails);

  Plotly.newPlot("pyramid", [{
    x: values,
    y: labels,
    type: "bar",
    orientation: "h"
  }], {
    title: "Falhas do Sistema (Triângulo 360º)",
    margin: {l: 160, r: 20, t: 40, b: 40}
  });
</script>

</body>
</html>
"@

    # AQUI está o pulo do gato: caminho fixo + Set-Content
    Set-Content -Path $HTML -Value $html -Encoding UTF8
    Say "📊 Painel HTML atualizado → $HTML" Green
}

# ============ CICLO TRIÂNGULO 360º ============

function Run-Cycle {
    Say ""
    Say ("================ Triângulo 360° — Ciclo às {0} ================" -f (Get-Date -Format "HH:mm:ss")) Yellow

    Test-DNS
    Test-HTTPS

    foreach ($t in $TABLES) {
        Test-REST $t
    }

    Generate-HTML

    # pequeno resumo de estabilidade
    $allLines = Get-Content $CSV | Select-Object -Skip 1
    $fails = ($allLines | Where-Object { $_ -like "*;FALHA;*" }).Count
    $total = $allLines.Count
    if ($total -gt 0) {
        $ok = $total - $fails
        $perc = [math]::Round(($ok / $total) * 100, 1)
        Say ("📈 Estabilidade REST (histórico): {0}% ({1}/{2})" -f $perc, $ok, $total) Cyan
    }

    Say "🔺 Triângulo 360º completo — abra o HTML no navegador pra ver a pirâmide." Cyan
}

# ============ EXECUÇÃO ============

if ($Loop) {
    while ($true) {
        Run-Cycle
        Start-Sleep -Seconds ($IntervaloMin * 60)
    }
} else {
    Run-Cycle
}
