# =============================================================
# PecuariaTech – Deploy + Monitoramento + Relatório v5.4.1
# UltraBiológica Cloud – Versão GitHub + Vercel + Supabase
# Autor: Richeles Alves
# =============================================================

Set-ExecutionPolicy Bypass -Scope Process -Force
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$SiteUrl = "https://www.pecuariatech.com"
cd $ProjectPath

Write-Host "[INFO] Iniciando UltraBiológica Cloud v5.4.1..." -ForegroundColor Cyan

# ==========================================
# Teste de endpoint com retry e latência
# ==========================================
function Test-Endpoint {
    param ([string]$url, [int]$attempts = 3)
    for ($i=1; $i -le $attempts; $i++) {
        try {
            $start = Get-Date
            $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 8
            $elapsed = (Get-Date) - $start
            if ($resp.StatusCode -eq 200) {
                return @{status="✅"; latency=[math]::Round($elapsed.TotalMilliseconds)}
            }
        } catch {}
        Start-Sleep -Seconds 2
    }
    return @{status="❌"; latency=0}
}

# ==========================================
# Checagem Supabase (corrigido para PS7+)
# ==========================================
function Check-Supabase {
    param ([string]$SupabaseUrl, [string]$SupabaseKey)

    if (($SupabaseUrl -eq $null) -or ($SupabaseUrl -eq "")) { $SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL }
    if (($SupabaseKey -eq $null) -or ($SupabaseKey -eq "")) { $SupabaseKey = $env:SUPABASE_ANON_KEY }

    if ((-not $SupabaseUrl) -or (-not $SupabaseKey)) {
        return @{ status = "🔴"; latency = 0; note = "env supabase ausente" }
    }

    try {
        $headers = @{
            "apikey" = $SupabaseKey
            "Authorization" = "Bearer $SupabaseKey"
        }
        $start = Get-Date
        $resp = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/racas?select=id&limit=1" -Headers $headers -Method GET -TimeoutSec 10
        $elapsed = (Get-Date) - $start
        if ($resp) {
            return @{ status = "🟢"; latency = [math]::Round($elapsed.TotalMilliseconds); note = "ok" }
        } else {
            return @{ status = "⚠️"; latency = [math]::Round($elapsed.TotalMilliseconds); note = "vazio" }
        }
    } catch {
        return @{ status = "🔴"; latency = 0; note = "erro ao conectar" }
    }
}

# ==========================================
# Relatório HTML + Logs + Gráfico Chart.js
# ==========================================
function Show-ProgressoPecuariaTech {
    param ([string]$ProjectPath, [string]$SiteUrl)

    $status = @{}
    $latencyData = @()

    $status["Ambiente PowerShell"] = "v$($PSVersionTable.PSVersion)"
    $utfFiles = Get-ChildItem -Path $ProjectPath -Recurse -Include *.tsx, *.ts, *.css
    $status["Arquivos UTF-8"] = if ($utfFiles.Count -gt 0) { "✅" } else { "❌" }

    $layout = Join-Path $ProjectPath "app\layout.tsx"
    if (Test-Path $layout) {
        $text = Get-Content $layout -Raw
        $status["Meta charset UTF-8"] = if ($text -match "<meta\s+charSet\s*=\s*""UTF-8""") { "✅" } else { "⚠️" }
    }

    $status["Dependências npm"] = if (Test-Path (Join-Path $ProjectPath "node_modules")) { "✅" } else { "❌" }
    $status["Build Next.js"] = if (Test-Path (Join-Path $ProjectPath ".next")) { "✅" } else { "⚠️" }

    $apis = @(
        "dashboard",
        "financeiro",
        "pastagem",
        "ultra/stats"
    )

    foreach ($api in $apis) {
        $res = Test-Endpoint -url "$SiteUrl/api/$api"
        $status["API $api"] = $res.status
        $latencyData += $res.latency
    }

    $sup = Check-Supabase
    $status["Supabase"] = $sup.status
    $latencyData += $sup.latency

    # Logs
    $logDir = Join-Path $ProjectPath "logs"
    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
    $timeStamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $logFileHtml = Join-Path $logDir "status-$timeStamp.html"

    $labels = ($status.Keys -join "','")
    $data = ($latencyData -join ",")

    $html = @"
<html>
<head>
<meta charset='UTF-8'>
<title>Status PecuariaTech</title>
<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
<style>
body { font-family:'Segoe UI'; background:#fafafa; color:#111; padding:30px;}
h1 { color:#0078D7; }
table { border-collapse: collapse; width:70%; margin-bottom:30px; }
td, th { border:1px solid #ddd; padding:8px; }
th { background:#0078D7; color:white; }
.status-ok {color:green;} .status-warn{color:orange;} .status-fail{color:red;}
</style>
</head>
<body>
<h1>📊 Status PecuariaTech – Relatório v5.4.1</h1>
<table>
<tr><th>Componente</th><th>Status</th></tr>
"@
    foreach ($item in $status.GetEnumerator()) {
        $class = switch -Regex ($item.Value) {
            "✅|🟢" { "status-ok" }
            "⚠️"   { "status-warn" }
            "❌|🔴" { "status-fail" }
            default { "" }
        }
        $html += "<tr><td>$($item.Key)</td><td class='$class'>$($item.Value)</td></tr>`n"
    }

    $html += @"
</table>
<canvas id='latencyChart' width='600' height='300'></canvas>
<script>
const ctx = document.getElementById('latencyChart');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['$labels'],
        datasets: [{
            label: 'Latência (ms)',
            data: [$data],
            backgroundColor: 'rgba(0, 120, 215, 0.6)',
            borderColor: 'rgba(0, 120, 215, 1)',
            borderWidth: 1
        }]
    },
    options: { scales: { y: { beginAtZero: true } } }
});
</script>
<footer>Gerado automaticamente em $(Get-Date)</footer>
</body>
</html>
"@

    $html | Out-File -FilePath $logFileHtml -Encoding UTF8
    Start-Process $logFileHtml
    Write-Host "`n📁 Relatório salvo em: $logFileHtml" -ForegroundColor DarkGray
}

# ==========================================
# Alertas WhatsApp/Telegram
# ==========================================
function Send-Alert {
    param ([string]$message, [bool]$force=$false)
    $phoneNumber = "5567999564560"
    if ($message -match "❌|🔴" -or $force) {
        $encoded = [System.Web.HttpUtility]::UrlEncode($message)
        Start-Process "https://api.whatsapp.com/send?phone=$phoneNumber&text=$encoded"
    }
}

# ==========================================
# Execução principal
# ==========================================
Write-Host "`n[1] Ajustando UTF-8..." -ForegroundColor Cyan
Get-ChildItem -Path $ProjectPath -Recurse -Include *.tsx,*.ts,*.css | ForEach-Object {
    (Get-Content $_.FullName) | Set-Content $_.FullName -Encoding UTF8
}

Write-Host "[2] Build Next.js..." -ForegroundColor Cyan
try { npm run build } catch { Write-Host "[ERRO] Build falhou" -ForegroundColor Red; exit 1 }

Write-Host "[3] Deploy Vercel..." -ForegroundColor Cyan
try { vercel --prod } catch { Write-Host "[ERRO] Deploy falhou" -ForegroundColor Red; exit 1 }

Write-Host "[4] Gerando relatório..." -ForegroundColor Cyan
Show-ProgressoPecuariaTech -ProjectPath $ProjectPath -SiteUrl $SiteUrl

Write-Host "`n✅ PecuariaTech voando com sucesso! 🚀" -ForegroundColor Green
