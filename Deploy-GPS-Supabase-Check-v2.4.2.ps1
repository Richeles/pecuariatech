# ================================================
# Deploy-GPS-Supabase-Check-v2.4.2.ps1
# ================================================

function Log {
    param($msg, $color = "White")
    $t = (Get-Date).ToString("HH:mm:ss")
    Write-Host "$t | $msg" -ForegroundColor $color
}

function Clamp01 {
    param($x)
    return [Math]::Max(0, [Math]::Min(1, [double]$x))
}

# Gráfico seguro (sem caracteres Unicode)
function Show-Bar {
    param([double]$val, [int]$width = 20)
    $p = [int][Math]::Round((Clamp01($val / 100)) * ($width - 1))
    $bar = ""
    for ($i = 0; $i -lt $width; $i++) {
        if ($i -le $p) { $bar += "#" } else { $bar += "-" }
    }
    return $bar
}

# ================================================
# CONFIGURAÇÕES
# ================================================
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogsDir = Join-Path $ProjectPath "logs"
if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }

$DomainUrl = "https://www.pecuariatech.com"
$GpsEndpoint = "$DomainUrl/api/sensor"
$SUPABASE_URL = "https://kpzjekflqpogzvayntdl.supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"
$SUPABASE_TABLE = "monitor_gps"

# ================================================
# TESTE DE ENDPOINT
# ================================================
function Test-Endpoint {
    param($url)
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $sw.Stop()
        return @{ ok = $true; status = $resp.StatusCode; ms = [math]::Round($sw.ElapsedMilliseconds, 2) }
    } catch {
        return @{ ok = $false; error = $_.Exception.Message }
    }
}

# ================================================
# EXECUÇÃO
# ================================================
$start = Get-Date
Log "Iniciando verificação v2.4.2 (GPS + Supabase + Domínio + CSV + Agendamento)" "Cyan"

$dom = Test-Endpoint $DomainUrl
$gps = Test-Endpoint $GpsEndpoint
$sb = Test-Endpoint $SUPABASE_URL

if ($dom.ok) { Log "Domínio OK: $($dom.status) - $($dom.ms)ms" "Green" } else { Log "Erro domínio: $($dom.error)" "Red" }
if ($gps.ok) { Log "GPS OK: $($gps.status) - $($gps.ms)ms" "Green" } else { Log "Erro GPS: $($gps.error)" "Yellow" }
if ($sb.ok) { Log "Supabase OK: $($sb.status) - $($sb.ms)ms" "Green" } else { Log "Erro Supabase: $($sb.error)" "Yellow" }

function RelDiffPct($a, $b) {
    if ($a -eq 0 -and $b -eq 0) { return 0 }
    $mx = [Math]::Max($a, $b)
    if ($mx -eq 0) { return 0 }
    return [math]::Round((([math]::Abs($a - $b) / $mx) * 100), 2)
}

$d1 = RelDiffPct $dom.ms $gps.ms
$d2 = RelDiffPct $dom.ms $sb.ms
$d3 = RelDiffPct $gps.ms $sb.ms

Log "Assimetria (% diferença relativa):"
Log " - Domínio vs GPS: $d1%"
Log " - Domínio vs Supabase: $d2%"
Log " - GPS vs Supabase: $d3%"

$vals = @($dom.ms, $gps.ms, $sb.ms)
$maxVal = [math]::Max(1, ($vals | Measure-Object -Maximum).Maximum)
$mean = ($vals | Measure-Object -Average).Average
$sumSq = ($vals | ForEach-Object { ($_ - $mean) * ($_ - $mean) } | Measure-Object -Sum).Sum
$stddev = [math]::Sqrt($sumSq / ($vals.Count))
$Comega = [math]::Round((1 - ($stddev / $maxVal)), 4)
Log "CΩ (Coef. Convergência): $Comega" "Cyan"

Log "Gráfico ASCII de latência:"
Log ("[Domínio ] " + (Show-Bar $d1))
Log ("[GPS     ] " + (Show-Bar $d3))
Log ("[Supabase] " + (Show-Bar $d2))

$payload = [PSCustomObject]@{
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    dominio_ms = $dom.ms
    gps_ms = $gps.ms
    supabase_ms = $sb.ms
    asym_dom_gps = $d1
    asym_dom_supabase = $d2
    asym_gps_supabase = $d3
    convergence = $Comega
}

$csvFile = Join-Path $LogsDir ("deploy_metrics_v2.4.2_{0}.csv" -f (Get-Date -Format "yyyy-MM-dd_HH-mm-ss"))
$payload | Export-Csv -Path $csvFile -NoTypeInformation -Encoding UTF8
Log "Resultados exportados em: $csvFile" "Green"

$TaskName = "Deploy-GPS-Supabase-Check-v2.4.2"
if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ProjectPath\Deploy-GPS-Supabase-Check-v2.4.2.ps1`""
    $trig1 = New-ScheduledTaskTrigger -Daily -At "06:00"
    $trig2 = New-ScheduledTaskTrigger -Daily -At "18:00"
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trig1,$trig2 -RunLevel Highest -Force
    Log "Agendamento criado: $TaskName" "Green"
} else {
    Log "Agendamento já existente: $TaskName" "Gray"
}

$end = Get-Date
$dur = [Math]::Round(($end - $start).TotalSeconds, 2)
Log "Tempo total: $dur s" "Cyan"
Log "Verificação concluída com sucesso!" "Green"
