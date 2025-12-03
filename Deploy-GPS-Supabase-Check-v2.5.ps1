# Deploy-GPS-Supabase-Check-v2.5.ps1
# Compatível com PowerShell 5 e 7 (Windows)
# Recursos: popup NotifyIcon + MessageBox, alerta sonoro, logs/CSV, scheduler

# =========================
# Helpers básicos (ASCII)
# =========================
function Clamp01([double]$x) { if($x -lt 0){0} elseif($x -gt 1){1} else {$x} }
function Show-Bar([double]$pct, [int]$width=22) {
  $pct = Clamp01($pct/100.0)
  $p = [int][Math]::Round($pct * ($width-1))
  $arr = @()
  for($i=0;$i -lt $width;$i++){ $arr += '-' }
  for($i=0;$i -le $p;$i++){ $arr[$i] = '#' }
  return ($arr -join '')
}
function Timestamp() { (Get-Date).ToString("HH:mm:ss") }
function Log($msg, $color="Gray") { Write-Host "$(Timestamp) | $msg" -ForegroundColor $color }

# =========================
# Configurações
# =========================
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogsDir = Join-Path $ProjectPath "logs"
if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }

$DomainUrl   = "https://www.pecuariatech.com"
$GpsEndpoint = "$DomainUrl/api/sensor"

# ATENÇÃO: chave sensível – você pediu para embutir.
# Não será escrita em logs.
$SUPABASE_URL = "https://kpzjekflqpogzvayntdl.supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"
$SUPABASE_TABLE = "monitor_gps"

# Limiar de assimetria para alerta
$AsymmetryAlertPct = 70

# =========================
# Testes HTTP
# =========================
function Test-Endpoint {
  param(
    [Parameter(Mandatory)] [string]$Url,
    [ValidateSet("GET","POST","HEAD")] [string]$Method = "GET",
    [int]$TimeoutSec = 10,
    $Body = $null
  )
  try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    if ($Method -eq "POST") {
      $resp = Invoke-WebRequest -Uri $Url -Method POST -Body ($Body | ConvertTo-Json -Depth 3) -ContentType "application/json" -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
    } elseif ($Method -eq "HEAD") {
      $resp = Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
    } else {
      $resp = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
    }
    $sw.Stop()
    return @{ ok=$true; status=$resp.StatusCode; ms=[math]::Round($sw.ElapsedMilliseconds,2) }
  } catch {
    return @{ ok=$false; error=$_.Exception.Message }
  }
}

function Test-GPS {
  # tenta POST; se 405, volta para GET
  $post = Test-Endpoint -Url $GpsEndpoint -Method POST -TimeoutSec 10 -Body @{ ping="ok"; ts=(Get-Date).ToUniversalTime().ToString("o") }
  if ($post.ok) { return $post }
  if ($post.error -match "405") {
    $get = Test-Endpoint -Url $GpsEndpoint -Method GET -TimeoutSec 10
    if ($get.ok) { return $get }
  }
  return $post
}

function Test-Supabase {
  # 1) HEAD raiz
  $h = Test-Endpoint -Url $SUPABASE_URL -Method HEAD -TimeoutSec 10
  if ($h.ok) { return $h }

  # 2) GET rest/v1 (autenticado) — aceitamos 200/401/404 como conectividade válida
  try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $resp = Invoke-WebRequest -Uri ($SUPABASE_URL.TrimEnd('/') + "/rest/v1/") `
      -Headers @{ apikey=$SUPABASE_SERVICE_ROLE_KEY; Authorization=("Bearer "+$SUPABASE_SERVICE_ROLE_KEY) } `
      -Method GET -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $sw.Stop()
    return @{ ok=$true; status=$resp.StatusCode; ms=[math]::Round($sw.ElapsedMilliseconds,2) }
  } catch {
    return @{ ok=$false; error=$_.Exception.Message }
  }
}

# =========================
# Métricas/assimetria
# =========================
function RelDiffPct($a, $b) {
  if ($null -eq $a -or $null -eq $b) { return 100 }
  if ($a -eq 0 -and $b -eq 0) { return 0 }
  $mx = [math]::Max($a,$b)
  if ($mx -le 0) { return 0 }
  return [math]::Round(([math]::Abs($a-$b)/$mx)*100,2)
}

# =========================
# Alertas (som + popup + msgbox)
# =========================
Add-Type -AssemblyName System.Windows.Forms | Out-Null
Add-Type -AssemblyName System.Drawing | Out-Null

function Alert-User($text, $logPath) {
  # som
  [console]::beep(1200,180)
  Start-Sleep -Milliseconds 120
  [console]::beep(800,200)

  # toast-like (NotifyIcon)
  $ni = New-Object System.Windows.Forms.NotifyIcon
  $ni.Icon = [System.Drawing.SystemIcons]::Warning
  $ni.BalloonTipTitle = "PecuariaTech - Alerta"
  $ni.BalloonTipText  = $text + "`nClique para abrir os logs."
  $ni.Visible = $true
  $ni.ShowBalloonTip(5000)
  # clique abre logs
  $ni.add_BalloonTipClicked({ Start-Process explorer.exe "/select,`"$logPath`"" })
  # liberar após alguns segundos
  Start-Sleep -Seconds 7
  $ni.Dispose()

  # MessageBox crítico
  $res = [System.Windows.Forms.MessageBox]::Show($text + "`n`nAbrir logs agora?", "PecuariaTech - Aviso",
        [System.Windows.Forms.MessageBoxButtons]::OKCancel,
        [System.Windows.Forms.MessageBoxIcon]::Warning)
  if ($res -eq [System.Windows.Forms.DialogResult]::OK) {
    Start-Process explorer.exe "/select,`"$logPath`""
  }
}

# =========================
# Execução
# =========================
$start = Get-Date
Log "Iniciando verificação v2.5 (GPS + Supabase + Domínio + CSV + Popup + Scheduler)" "Cyan"

# Testes
$dom = Test-Endpoint -Url $DomainUrl -Method GET -TimeoutSec 10
if ($dom.ok) { Log "Domínio OK: $($dom.status) - $($dom.ms) ms" "Green" } else { Log "Erro Domínio: $($dom.error)" "Yellow" }

$gps = Test-GPS
if ($gps.ok) { Log "GPS OK: $($gps.status) - $($gps.ms) ms" "Green" } else { Log "Erro GPS: $($gps.error)" "Yellow" }

$sb = Test-Supabase
if ($sb.ok) { Log "Supabase OK: $($sb.status) - $($sb.ms) ms" "Green" } else { Log "Erro Supabase: $($sb.error)" "Red" }

# Assimetria
$d1 = RelDiffPct $dom.ms $gps.ms
$d2 = RelDiffPct $dom.ms $sb.ms
$d3 = RelDiffPct $gps.ms $sb.ms

Log "Assimetria (% diferença relativa):" "Gray"
Log (" - Domínio vs GPS: {0}%" -f $d1) "Gray"
Log (" - Domínio vs Supabase: {0}%" -f $d2) "Gray"
Log (" - GPS vs Supabase: {0}%" -f $d3) "Gray"

# Convergência (CΩ simplificado)
$vals = @()
if ($dom.ok) { $vals += $dom.ms }
if ($gps.ok) { $vals += $gps.ms }
if ($sb.ok)  { $vals += $sb.ms  }
if ($vals.Count -lt 2) { $vals = @(0,0) }

$maxVal = [math]::Max(1, ($vals | Measure-Object -Maximum).Maximum)
$mean   = ($vals | Measure-Object -Average).Average
$sumSq  = ($vals | ForEach-Object { ($_ - $mean) * ($_ - $mean) } | Measure-Object -Sum).Sum
$stddev = [math]::Sqrt($sumSq / ($vals.Count))
$Comega = [math]::Round((1 - ($stddev / $maxVal)), 4)
Log ("CΩ (coeficiente de convergência): {0}" -f $Comega) "Cyan"

# Gráfico ASCII
Log "Gráfico ASCII de latência (quanto MAIOR a barra, MAIOR a diferença):" "Gray"
Log ("[Domínio ] " + (Show-Bar $d1)) "Gray"
Log ("[GPS     ] " + (Show-Bar $d3)) "Gray"
Log ("[Supabase] " + (Show-Bar $d2)) "Gray"

# CSV
$payload = [PSCustomObject]@{
  timestamp           = (Get-Date).ToUniversalTime().ToString("o")
  dominio_ms          = $(if($dom.ok){$dom.ms}else{$null})
  gps_ms              = $(if($gps.ok){$gps.ms}else{$null})
  supabase_ms         = $(if($sb.ok){$sb.ms}else{$null})
  asym_dom_gps        = $d1
  asym_dom_supabase   = $d2
  asym_gps_supabase   = $d3
  convergence         = $Comega
}
$csvFile = Join-Path $LogsDir ("deploy_metrics_v2.5_{0}.csv" -f (Get-Date -Format "yyyy-MM-dd_HH-mm-ss"))
$payload | Export-Csv -Path $csvFile -NoTypeInformation -Encoding UTF8
Log "Resultados exportados em: $csvFile" "Green"

# Alerta se acima do limiar
$maxAsym = [math]::Max($d1,[math]::Max($d2,$d3))
if ($maxAsym -ge $AsymmetryAlertPct) {
  $txt = "Assimetria alta detectada (≥ $AsymmetryAlertPct%). máx=$maxAsym%. Verifique os logs."
  Alert-User -text $txt -logPath $csvFile
}

# Agendamento (06:00 e 18:00)
$TaskName = "Deploy-GPS-Supabase-Check-v2.5"
try {
  if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
    $selfPath = Join-Path $ProjectPath "Deploy-GPS-Supabase-Check-v2.5.ps1"
    $arg = "-NoProfile -ExecutionPolicy Bypass -File `"$selfPath`""
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument $arg
    $trig1  = New-ScheduledTaskTrigger -Daily -At  "06:00"
    $trig2  = New-ScheduledTaskTrigger -Daily -At  "18:00"
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trig1,$trig2 -RunLevel Highest -Force | Out-Null
    Log "Agendamento criado: $TaskName" "Green"
  } else {
    Log "Agendamento já existe: $TaskName" "Gray"
  }
} catch { Log "Falha ao criar agendamento: $($_.Exception.Message)" "Yellow" }

$end = Get-Date
$dur = [math]::Round(($end - $start).TotalSeconds,2)
Log "Tempo total: $dur s" "Cyan"
Log "Verificação concluída." "Green"
