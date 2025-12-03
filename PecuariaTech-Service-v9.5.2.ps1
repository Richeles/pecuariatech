<#
🌾 PecuariaTech-Service v9.5.2 — Triângulo 360º
PowerShell 7.5.4  |  Richeles Alves © 2025
#>

# Caminho base
$BASE  = "C:\Users\Administrador\pecuariatech"
$LOGS  = Join-Path $BASE "logs"
$CSV   = Join-Path $LOGS "status_triangulo360.csv"
$HTML  = Join-Path $LOGS "status_triangulo360.html"
$ENVF  = Join-Path $BASE ".env"

foreach ($p in @($LOGS)) { if (!(Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }

function Say($msg,$c="White"){ Write-Host $msg -ForegroundColor $c }
function Log($i,$s,$d,$ms){ Add-Content $CSV ("{0};{1};{2};{3};{4}" -f (Get-Date -Format "s"),$i,$s,($d -replace ";",","),$ms) }

# --- Variáveis de ambiente automáticas ---
function Load-Env {
    if (Test-Path $ENVF) {
        Get-Content $ENVF | ForEach-Object {
            if ($_ -match "^(.*?)=(.*)$") {
                $name = $matches[1].Trim()
                $val  = $matches[2].Trim()
                $env:$name = $val
            }
        }
    }
}

function Ensure-Env {
    Load-Env
    if (-not $env:PECUARIA_SUPABASE_URL) {
        $env:PECUARIA_SUPABASE_URL = Read-Host "Digite a URL do seu projeto Supabase (ex: https://meu.supabase.co)"
    }
    if (-not $env:PECUARIA_SUPABASE_KEY) {
        $env:PECUARIA_SUPABASE_KEY = Read-Host "Digite sua chave SERVICE_ROLE do Supabase"
    }

    # grava em .env e persiste com setx
    Set-Content -Path $ENVF -Value @(
        "PECUARIA_SUPABASE_URL=$($env:PECUARIA_SUPABASE_URL)"
        "PECUARIA_SUPABASE_KEY=$($env:PECUARIA_SUPABASE_KEY)"
    )
    setx PECUARIA_SUPABASE_URL $env:PECUARIA_SUPABASE_URL | Out-Null
    setx PECUARIA_SUPABASE_KEY $env:PECUARIA_SUPABASE_KEY | Out-Null
    Say "🔧 Variáveis de ambiente carregadas e salvas em $ENVF" Green
}

Ensure-Env

# --- Funções de teste ---
function Test-DNS {
    try {
        Resolve-DnsName "pecuariatech.com" | Out-Null
        Resolve-DnsName "www.pecuariatech.com" | Out-Null
        Say "✅ DNS OK" Green
        Log "DNS" "OK" "resolvido" 0
    } catch { Say "❌ DNS falhou" Red; Log "DNS" "FALHA" $_.Exception.Message 0 }
}

function Test-HTTPS {
    $url="https://www.pecuariatech.com"
    $sw=[Diagnostics.Stopwatch]::StartNew()
    try {
        $r=Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
        $sw.Stop()
        Say "✅ HTTPS OK ($([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms)" Green
        Log "HTTPS" "OK" $r.StatusCode $sw.Elapsed.TotalMilliseconds
    } catch {
        $sw.Stop()
        Say "❌ HTTPS falhou" Red
        Log "HTTPS" "FALHA" $_.Exception.Message $sw.Elapsed.TotalMilliseconds
    }
}

function Test-REST($table){
    $url="$($env:PECUARIA_SUPABASE_URL)/rest/v1/$table?limit=1"
    $sw=[Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-RestMethod -Uri $url -Headers @{
            apikey=$env:PECUARIA_SUPABASE_KEY
            Authorization="Bearer $($env:PECUARIA_SUPABASE_KEY)"
        } -TimeoutSec 10 | Out-Null
        $sw.Stop()
        Say "🟢 $table OK ($([math]::Round($sw.Elapsed.TotalMilliseconds,2)) ms)" Green
        Log "REST_$table" "OK" "200" $sw.Elapsed.TotalMilliseconds
    } catch {
        $sw.Stop()
        Say "🔴 $table FALHOU" Red
        Log "REST_$table" "FALHA" $_.Exception.Message $sw.Elapsed.TotalMilliseconds
    }
}

# --- Gera HTML ---
function Generate-HTML {
    if (!(Test-Path $CSV)) { return }
    $rows = Get-Content $CSV | Select-Object -Skip 1
    $data = @()
    foreach ($ln in $rows) {
        $p=$ln -split ';',5
        if ($p.Count -eq 5){
            $d=0;[double]::TryParse($p[4],[ref]$d)|Out-Null
            $data += [PSCustomObject]@{time=$p[0];item=$p[1];status=$p[2];detail=$p[3];ms=$d}
        }
    }
    $json=$data|ConvertTo-Json -Compress
    $html=@"
<!DOCTYPE html><html><head><meta charset='utf-8'><title>PecuariaTech</title>
<script src='https://cdn.plot.ly/plotly-2.27.0.min.js'></script>
<style>body{background:#0f172a;color:#eee;font-family:Arial;text-align:center;}
.card{background:#111c40;padding:10px;margin:8px;border-radius:10px}</style></head>
<body><h2>🌾 PecuariaTech — Triângulo 360º</h2><div id='pyramid' class='card'></div>
<script>const d=$json;const f={};for(const r of d){if(r.status==='FALHA'){f[r.item]=(f[r.item]||0)+1}}
Plotly.newPlot('pyramid',[{x:Object.values(f),y:Object.keys(f),type:'bar',orientation:'h'}],
{title:'Falhas do Sistema',margin:{l:160,r:20,t:40,b:40}});</script></body></html>
"@
    [System.IO.File]::WriteAllText($HTML,$html,[System.Text.Encoding]::UTF8)
    Say "📊 Painel atualizado → $HTML" Green
}

# --- Loop principal ---
if (!(Test-Path $CSV)) { "time;item;status;detail;ms"|Out-File $CSV }

Say "🚀 Iniciando PecuariaTech Service v9.5.2 — $(Get-Date -Format 'HH:mm:ss')" Yellow

while ($true) {
    Say "==== Ciclo $(Get-Date -Format 'HH:mm:ss') ====" Cyan
    Test-DNS
    Test-HTTPS
    foreach ($t in @("pastagem","rebanho","financeiro","racas","dashboard")){ Test-REST $t }
    Generate-HTML
    Start-Sleep -Seconds 60
}
