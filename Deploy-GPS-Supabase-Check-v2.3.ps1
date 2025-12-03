# Deploy-GPS-Supabase-Check-v2.3.ps1
# Verificacao GPS + Supabase + Dominio + CSV + tratamento de cores

$ErrorActionPreference = "Stop"
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogDir = "$ProjectPath\logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$Ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$LogFile = "$LogDir\deploy_check_v2.3_$Ts.log"
$CsvFile = "$LogDir\deploy_metrics_v2.3_$Ts.csv"

# Função de log com filtro de cor seguro
function Log([string]$msg, [string]$color="White") {
  $validColors = @("Black","DarkBlue","DarkGreen","DarkCyan","DarkRed","DarkMagenta","DarkYellow","Gray","DarkGray","Blue","Green","Cyan","Red","Magenta","Yellow","White")
  if ($validColors -notcontains $color) { $color = "White" }
  $t = Get-Date -Format "HH:mm:ss"
  Write-Host "$t | $msg" -ForegroundColor $color
  Add-Content -Path $LogFile -Value "$t | $msg"
}

function CheckVar([string]$name) {
  $v = [Environment]::GetEnvironmentVariable($name,"Machine")
  if ([string]::IsNullOrWhiteSpace($v)) { Log "VAR AUSENTE: $name" "Yellow"; return $false }
  Log "VAR OK: $name" "Green"; return $true
}

function Measure-Http([string]$url, [string]$method="GET", [string]$bodyJson=$null, [int]$timeout=15) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $headers = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  try {
    if ($null -ne $bodyJson) {
      $resp = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -Body $bodyJson -ContentType "application/json" -TimeoutSec $timeout -UseBasicParsing
    } else {
      $resp = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -TimeoutSec $timeout -UseBasicParsing
    }
    $sw.Stop()
    return [pscustomobject]@{
      Url = $url; Method = $method; StatusCode = $resp.StatusCode
      Ms = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
      Ok = $true; Error = $null; SizeBytes = ($resp.RawContentLength)
    }
  } catch {
    $sw.Stop()
    return [pscustomobject]@{
      Url = $url; Method = $method; StatusCode = $null
      Ms = [math]::Round($sw.Elapsed.TotalMilliseconds,2)
      Ok = $false; Error = $_.Exception.Message; SizeBytes = $null
    }
  }
}

function Measure-PingMs([string]$hostName, [int]$count=3) {
  try {
    $p = Test-Connection -TargetName $hostName -Count $count -ErrorAction Stop
    $avg = ($p | Measure-Object ResponseTime -Average).Average
    return [math]::Round([double]$avg,2)
  } catch {
    return $null
  }
}

function Bar([double]$ms, [double]$maxMs=1000) {
  if ($ms -lt 0) { $ms = 0 }
  $width = 30
  $ratio = [math]::Min(1.0, $ms / $maxMs)
  $filled = [int]([math]::Round($ratio * $width))
  $bar = ('#' * $filled) + ('-' * ($width - $filled))
  return "[$bar] " + ("{0} ms" -f ([math]::Round($ms,2)))
}

# Início
Log "Inicio da verificacao v2.3 (GPS + Supabase + Dominio + CSV + Alerta)."
$start = Get-Date

# Variáveis
$ok = $true
$ok = (CheckVar "NEXT_PUBLIC_SUPABASE_URL") -and $ok
$ok = (CheckVar "NEXT_PUBLIC_SUPABASE_ANON_KEY") -and $ok
$ok = (CheckVar "SUPABASE_SERVICE_ROLE_KEY") -and $ok
if (-not $ok) { Log "Falha: variaveis ausentes." "Red"; exit 1 }

$domain = "https://www.pecuariatech.com"
$DomainHost = "www.pecuariatech.com"
$supabaseUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL","Machine")

# 1️⃣ Dominio
Log "Validando dominio: $domain" "Cyan"
$dResp = Measure-Http -url $domain -method "GET" -timeout 15
if ($dResp.Ok -and $dResp.StatusCode -eq 200) {
  Log "Dominio OK: HTTP 200 em $($dResp.Ms) ms, $($dResp.SizeBytes) bytes." "Green"
} else { Log "Dominio ERRO: $($dResp.Error)" "Red" }

$dnsMs = Measure-PingMs -hostName $DomainHost -count 3
if ($dnsMs -ne $null) { Log "Ping medio: $dnsMs ms" "Gray" }

# 2️⃣ GPS POST
$gpsEndpoint = "$domain/api/sensor"
$gpsBody = @{
  deviceId = "UBI-TRI360-01"
  ts = (Get-Date).ToString("o")
  location = @{ lat = -20.443; lng = -54.646; accuracy = 12 }
  metrics = @{ alpha = 0.23; beta = 0.37; gamma = 0.41; threshold = 0.70 }
} | ConvertTo-Json -Depth 5

Log "Testando GPS via POST: $gpsEndpoint" "Cyan"
$gpsResp = Measure-Http -url $gpsEndpoint -method "POST" -bodyJson $gpsBody -timeout 15
if ($gpsResp.Ok -and $gpsResp.StatusCode -in 200,201,202) {
  Log "GPS OK: HTTP $($gpsResp.StatusCode) em $($gpsResp.Ms) ms." "Green"
} else {
  Log "⚠️ GPS ALERTA: status=$($gpsResp.StatusCode) tempo=$($gpsResp.Ms) ms erro=$($gpsResp.Error)" "Yellow"
}

# 3️⃣ Supabase
Log "Testando Supabase URL: $supabaseUrl" "Cyan"
if ($supabaseUrl -match "^https?://") {
  $sbResp = Measure-Http -url $supabaseUrl -method "GET" -timeout 15
  if ($sbResp.Ok) {
    Log "Supabase OK: HTTP $($sbResp.StatusCode) em $($sbResp.Ms) ms ($($sbResp.SizeBytes) bytes)" "Green"
  } else { Log "⚠️ Supabase ERRO: $($sbResp.Error)" "Yellow" }
} else { Log "Supabase URL invalida (defina NEXT_PUBLIC_SUPABASE_URL corretamente)." "Red" }

# 4️⃣ Gargalo
if ($dnsMs -ne $null -and $dResp.Ms -ne $null) {
  $limite = ($dnsMs * 5) + 100
  if ($dResp.Ms -gt $limite) {
    Log "⚠️ GARGALO OPERADOR: HTTP $($dResp.Ms) ms > limite $([math]::Round($limite,2)) ms" "Yellow"
  } else { Log "Operador OK: dentro do limite ($([math]::Round($limite,2)) ms)" "Green" }
}

# 5️⃣ Assimetria
function RelDiff($a, $b) {
  if ($a -eq $null -or $b -eq $null -or $a -le 0 -or $b -le 0) { return $null }
  $m = [math]::Max($a,$b); $n = [math]::Min($a,$b)
  return [math]::Round((($m - $n) / $m) * 100, 2)
}

$diffDomGps = RelDiff $dResp.Ms $gpsResp.Ms
$diffDomSb  = RelDiff $dResp.Ms $sbResp.Ms
$diffGpsSb  = RelDiff $gpsResp.Ms $sbResp.Ms
Log "Assimetria (% diferenca relativa):"
if ($diffDomGps -ne $null) { Log " - Dominio vs GPS: $diffDomGps %" "Gray" }
if ($diffDomSb  -ne $null) { Log " - Dominio vs Supabase: $diffDomSb %" "Gray" }
if ($diffGpsSb  -ne $null) { Log " - GPS vs Supabase: $diffGpsSb %" "Gray" }

if (($diffDomGps -gt 70) -or ($diffGpsSb -gt 70) -or ($diffDomSb -gt 70)) {
  Log "⚠️ Alerta: Assimetria acima de 70% detectada." "Yellow"
}

# 6️⃣ Grafico ASCII
$maxRef = @($dResp.Ms, $gpsResp.Ms, $sbResp.Ms, 300) | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
Log "Grafico ASCII de latencia:" "Cyan"
if ($dResp.Ms) { Log "[Dominio  ] " + (Bar $dResp.Ms $maxRef) "White" }
if ($gpsResp.Ms) { Log "[GPS POST ] " + (Bar $gpsResp.Ms $maxRef) "White" }
if ($sbResp.Ms) { Log "[Supabase ] " + (Bar $sbResp.Ms $maxRef) "White" }

# 7️⃣ CSV
$csvData = @()
$csvData += [pscustomobject]@{ Endpoint="Dominio"; Status=$dResp.StatusCode; Tempo_ms=$dResp.Ms; Bytes=$dResp.SizeBytes; Erro=$dResp.Error }
$csvData += [pscustomobject]@{ Endpoint="GPS"; Status=$gpsResp.StatusCode; Tempo_ms=$gpsResp.Ms; Bytes=$gpsResp.SizeBytes; Erro=$gpsResp.Error }
$csvData += [pscustomobject]@{ Endpoint="Supabase"; Status=$sbResp.StatusCode; Tempo_ms=$sbResp.Ms; Bytes=$sbResp.SizeBytes; Erro=$sbResp.Error }
$csvData | Export-Csv -Path $CsvFile -NoTypeInformation -Encoding UTF8
Log "Resultados exportados para CSV: $CsvFile" "Cyan"

# 🔚 Fim
$elapsed = (Get-Date) - $start
Log "Tempo total: $([math]::Round($elapsed.TotalSeconds,2)) s" "Gray"
Log "Verificacao v2.3 concluida com sucesso." "Green"
