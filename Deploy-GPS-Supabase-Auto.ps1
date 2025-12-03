<#
  Deploy-GPS-Supabase-Auto.ps1
  Monitora: Dominio, endpoint GPS, tenta inserir métricas no Supabase (REST).
  Usa variáveis de ambiente ou pede chave de forma segura.
  Parâmetros:
    -AutoUpload   : tenta inserir no Supabase
    -ShowPopup    : mostra popup desktop com resumo
    -Schedule     : registra tarefa agendada diária (06:00, 18:00)
#>

param(
  [switch]$AutoUpload,
  [switch]$ShowPopup,
  [switch]$Schedule
)

# ----------------------------
# Utilitários / Logging
# ----------------------------
function Log {
  param($msg, $color = "White")
  $t = (Get-Date).ToString("HH:mm:ss")
  Write-Host "$t | $msg" -ForegroundColor $color
}

# Popup usando PresentationFramework (works on Windows)
function Show-Popup {
  param($title, $body)
  try {
    Add-Type -AssemblyName PresentationFramework -ErrorAction Stop
    [System.Windows.MessageBox]::Show($body, $title, "OK", "None") | Out-Null
  } catch {
    # fallback: Write-Host
    Write-Host "POPUP: $title - $body"
  }
}

# ----------------------------
# Config defaults
# ----------------------------
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogsDir = Join-Path $ProjectPath "logs"
if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }

# Domínio e endpoint (ajuste se necessário)
$DomainUrl = "https://www.pecuariatech.com"
$GpsEndpoint = "$DomainUrl/api/sensor"
$CsvPrefix = "deploy_metrics_auto"

# Supabase: prefer env vars, senão pede
$envUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL","Machine")
$envKey = [Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY","Machine")

if ([string]::IsNullOrWhiteSpace($envUrl)) {
  $SUPABASE_URL = Read-Host "NEXT_PUBLIC_SUPABASE_URL (ex: https://<projeto>.supabase.co)"
} else { $SUPABASE_URL = $envUrl }

if ([string]::IsNullOrWhiteSpace($envKey)) {
  Write-Host "Chave SUPABASE SERVICE ROLE ausente nas variáveis de ambiente. Digite-a (não será exibida):"
  $secure = Read-Host -AsSecureString "SUPABASE_SERVICE_ROLE_KEY"
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $SUPABASE_SERVICE_ROLE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
} else {
  $SUPABASE_SERVICE_ROLE_KEY = $envKey
}

# Headers para Supabase (se usados)
$headers = @{
  "apikey" = $SUPABASE_SERVICE_ROLE_KEY
  "Authorization" = "Bearer $SUPABASE_SERVICE_ROLE_KEY"
  "Content-Type" = "application/json"
}

# ----------------------------
# Test endpoint helper
# ----------------------------
function Test-Endpoint {
  param($url, $method = "GET", $body = $null, $timeoutSec = 10)
  try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $resp = Invoke-WebRequest -Uri $url -Method $method -Body $body -UseBasicParsing -TimeoutSec $timeoutSec -ErrorAction Stop
    $sw.Stop()
    return @{ ok = $true; status = $resp.StatusCode; ms = [math]::Round($sw.ElapsedMilliseconds,2); content=$resp.Content }
  } catch {
    $err = $_.Exception.Message
    return @{ ok = $false; error = $err; ms = 0 }
  }
}

# ----------------------------
# Diferença relativa (%)
# ----------------------------
function RelDiffPct([double]$a, [double]$b) {
  if ($a -eq 0 -and $b -eq 0) { return 0 }
  $mx = [Math]::Max($a, $b)
  if ($mx -eq 0) { return 0 }
  return [math]::Round((([math]::Abs($a - $b) / $mx) * 100), 2)
}

# ASCII bar (width 20)
function Show-Bar([double]$val, [int]$width=20) {
  $pct = Clamp01($val/100)
  $filled = [int]([math]::Round($pct * $width))
  $arr = @()
  for ($i=0; $i -lt $width; $i++) { $arr += (if ($i -lt $filled) { '#' } else { '-' }) }
  return ($arr -join '')
}
function Clamp01([double]$x) { if ($x -lt 0) {0} elseif ($x -gt 1) {1} else {$x} }

# ----------------------------
# Inserção no Supabase (REST)
# ----------------------------
function Insert-SupabaseRecord {
  param([hashtable]$payload)
  if ([string]::IsNullOrWhiteSpace($SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($SUPABASE_SERVICE_ROLE_KEY)) {
    return @{ ok=$false; error="Supabase URL/KEY missing" }
  }
  try {
    $uri = "$SUPABASE_URL/rest/v1/monitor_gps"
    $json = ($payload | ConvertTo-Json -Depth 4)
    $resp = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $json -ErrorAction Stop
    return @{ ok=$true; result=$resp }
  } catch {
    return @{ ok=$false; error=$_.Exception.Message }
  }
}

# ----------------------------
# Execução principal
# ----------------------------
$start = Get-Date
Log "Iniciando verificação automática (GPS + Supabase + Domínio)" "Cyan"

# 1) Testa domínio (GET)
$dom = Test-Endpoint $DomainUrl "GET"
if ($dom.ok) { Log "Domínio OK: $($dom.status) - $($dom.ms)ms" "Green" } else { Log "Erro domínio: $($dom.error)" "Red" }

# 2) Testa endpoint GPS (POST preferred; if 405, try GET)
$gps = Test-Endpoint $GpsEndpoint "POST"
if (-not $gps.ok -and $gps.error -match "405") {
  # servidor rejeitou POST — tentar GET (algumas impl. usam GET)
  $gps = Test-Endpoint $GpsEndpoint "GET"
}
if ($gps.ok) { Log "GPS OK: $($gps.status) - $($gps.ms)ms" "Green" } else { Log "Erro GPS: $($gps.error)" "Yellow" }

# 3) Testa Supabase base URL (GET root)
$sb = Test-Endpoint $SUPABASE_URL "GET"
if ($sb.ok) { Log "Supabase OK: $($sb.status) - $($sb.ms)ms" "Green" } else { Log "Erro Supabase: $($sb.error)" "Yellow" }

# 4) Assimetrias e convergência
$d1 = RelDiffPct $dom.ms $gps.ms
$d2 = RelDiffPct $dom.ms $sb.ms
$d3 = RelDiffPct $gps.ms $sb.ms
Log "Assimetria (% diferença relativa):"
Log " - Domínio vs GPS: $d1%" "Gray"
Log " - Domínio vs Supabase: $d2%" "Gray"
Log " - GPS vs Supabase: $d3%" "Gray"

# coeficiente de convergência (simple)
$vals = @($dom.ms, $gps.ms, $sb.ms)
$maxVal = [math]::Max(1, ($vals | Measure-Object -Maximum).Maximum)
$mean = ($vals | Measure-Object -Average).Average
$sumSq = ($vals | ForEach-Object { ($_ - $mean) * ($_ - $mean) } | Measure-Object -Sum).Sum
$stddev = [math]::Sqrt($sumSq / ($vals.Count))
$Comega = [math]::Round((1 - ($stddev / $maxVal)), 4)
Log "CΩ (coeficiente de convergência): $Comega" "Cyan"

# Gráfico ASCII
Log "Gráfico ASCII de latência (maior barra = maior diferença):" "Gray"
Log ("[Domínio ] " + (Show-Bar $d1)) "Gray"
Log ("[GPS     ] " + (Show-Bar $d3)) "Gray"
Log ("[Supabase] " + (Show-Bar $d2)) "Gray"

# 5) Export CSV
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
$csvFile = Join-Path $LogsDir ("{0}_{1}.csv" -f $CsvPrefix, (Get-Date -Format "yyyy-MM-dd_HH-mm-ss"))
$payload | Export-Csv -Path $csvFile -NoTypeInformation -Encoding UTF8
Log "Resultados exportados em: $csvFile" "Green"

# 6) Inserção opcional no Supabase
if ($AutoUpload) {
  Log "Tentando inserir registro no Supabase..." "Cyan"
  $ins = Insert-SupabaseRecord -payload $payload
  if ($ins.ok) {
    Log "Registro enviado ao Supabase." "Green"
  } else {
    Log "Falha ao inserir no Supabase: $($ins.error)" "Yellow"
  }
}

# 7) Popup resumo
if ($ShowPopup) {
  $title = "PecuariaTech — Monitor GPS"
  $body = "Domínio: $($dom.status) / $($dom.ms)ms`nGPS: $($gps.status) / $($gps.ms)ms`nSupabase: $(if($sb.ok){$sb.status}else{'ERR'}) / $($sb.ms)ms`nAssimetria Dom vs GPS: $d1%`nConvergência: $Comega"
  Show-Popup -title $title -body $body
}

# 8) Agenda (opcional)
if ($Schedule) {
  $TaskName = "PecuariaTech-Monitor-GPS-Auto"
  if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ProjectPath\Deploy-GPS-Supabase-Auto.ps1`" -AutoUpload -ShowPopup"
    $trig1 = New-ScheduledTaskTrigger -Daily -At "06:00"
    $trig2 = New-ScheduledTaskTrigger -Daily -At "18:00"
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trig1,$trig2 -RunLevel Highest -Force
    Log "Agendamento criado: $TaskName" "Green"
  } else {
    Log "Agendamento já existente: $TaskName" "Gray"
  }
}

# final
$dur = [math]::Round((Get-Date - (Get-Date $start)).TotalSeconds,2)
Log "Tempo total: $dur s" "Cyan"
Log "Verificação concluída." "Green"
