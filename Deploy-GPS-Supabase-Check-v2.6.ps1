# ===================== PecuariaTech - Deploy/Check v2.6 ======================
# Rotina: valida domínio, GPS e Supabase; calcula assimetria e CΩ;
# salva CSV/log; popup interativo; agenda 05:30 e 17:30; insere no Supabase.
# ============================================================================

# --------- CONFIG ---------
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogsDir = Join-Path $ProjectPath "logs"
if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }

$DomainUrl   = "https://www.pecuariatech.com"
$GpsEndpoint = "$DomainUrl/api/sensor"

# Supabase (projeto real informado)
$PROJECT_REF = "kpzzekflqpoeccnqfkng"
$SUPABASE_URL = "https://$PROJECT_REF.supabase.co"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"
$SUPABASE_TABLE = "monitor_gps"

# --------- FUNÇÕES UTIL ---------
function Log([string]$msg, [string]$color="Gray") {
  $t = (Get-Date -Format "HH:mm:ss")
  Write-Host "$t | $msg" -ForegroundColor $color
}

function Clamp01([double]$x){ [Math]::Max(0,[Math]::Min(1,$x)) }

function RelDiffPct($a, $b) {
  if ($a -eq 0 -and $b -eq 0) { return 0 }
  $mx = [Math]::Max($a,$b)
  if ($mx -eq 0) { return 0 }
  return [math]::Round(([math]::Abs($a-$b)/$mx)*100,2)
}

function Show-Bar([double]$pct,[int]$width=22){
  $p  = [int][Math]::Round((Clamp01($pct/100))*($width-1))
  $arr = @()
  for($i=0;$i -lt $width;$i++){ $arr += '-' }
  for($i=0;$i -le $p;$i++){ $arr[$i] = '#' }
  return ($arr -join '')
}

function Test-GET([string]$url){
  try{
    $sw=[Diagnostics.Stopwatch]::StartNew()
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10 -Method GET -ErrorAction Stop
    $sw.Stop()
    return @{ ok=$true; status=[int]$resp.StatusCode; ms=[math]::Round($sw.ElapsedMilliseconds,2) }
  } catch {
    return @{ ok=$false; error=$_.Exception.Message; ms=0 }
  }
}

function Test-POST([string]$url,[object]$body){
  try{
    $sw=[Diagnostics.Stopwatch]::StartNew()
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10 -Method POST -ContentType "application/json" -Body ($body | ConvertTo-Json -Depth 5) -ErrorAction Stop
    $sw.Stop()
    return @{ ok=$true; status=[int]$resp.StatusCode; ms=[math]::Round($sw.ElapsedMilliseconds,2) }
  } catch {
    return @{ ok=$false; error=$_.Exception.Message; ms=0 }
  }
}

function Insert-SupabaseRecord([hashtable]$payload){
  try{
    $headers = @{
      "apikey"       = $SUPABASE_SERVICE_ROLE_KEY
      "Authorization"= "Bearer $SUPABASE_SERVICE_ROLE_KEY"
      "Content-Type" = "application/json"
      "Prefer"       = "return=representation"
    }
    $url = "$SUPABASE_URL/rest/v1/$SUPABASE_TABLE"
    $resp = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body (@($payload) | ConvertTo-Json -Depth 6)
    return @{ ok=$true; data=$resp }
  } catch {
    return @{ ok=$false; error=$_.Exception.Message }
  }
}

function Show-Popup([string]$text,[string]$title="PecuariaTech - Monitor GPS"){
  try{
    Add-Type -AssemblyName System.Windows.Forms | Out-Null
    return [System.Windows.Forms.MessageBox]::Show($text,$title,[System.Windows.Forms.MessageBoxButtons]::YesNo,[System.Windows.Forms.MessageBoxIcon]::Information)
  } catch {
    Log "Popup indisponível (modo servidor). Prosseguindo sem interação." "Yellow"
    return "Yes"
  }
}

# --------- EXECUÇÃO ---------
$start = Get-Date
Log "Iniciando verificação v2.6 (GPS + Supabase + Domínio + CSV + Popup + Scheduler)" "Cyan"

# 1) Testes
$dom = Test-GET $DomainUrl
$gps = Test-POST $GpsEndpoint @{ ping = (Get-Date).ToUniversalTime().ToString("o") }
$sb  = Test-GET  "$SUPABASE_URL/rest/v1/$SUPABASE_TABLE?select=count"

if($dom.ok){ Log "Domínio OK: $($dom.status) - $($dom.ms) ms" "Green" } else { Log "Erro Domínio: $($dom.error)" "Red" }
if($gps.ok){ Log "GPS OK: $($gps.status) - $($gps.ms) ms" "Green" } else { Log "Erro GPS: $($gps.error)" "Yellow" }
if($sb.ok) { Log "Supabase OK: $($sb.status) - $($sb.ms) ms" "Green" } else { Log "Erro Supabase: $($sb.error)" "Yellow" }

# 2) Assimetria e Convergência
$d1 = RelDiffPct $dom.ms $gps.ms
$d2 = RelDiffPct $dom.ms $sb.ms
$d3 = RelDiffPct $gps.ms $sb.ms
Log "Assimetria (% diferença relativa):"
Log (" - Domínio vs GPS: {0}%" -f $d1)
Log (" - Domínio vs Supabase: {0}%" -f $d2)
Log (" - GPS vs Supabase: {0}%" -f $d3)

$vals = @($dom.ms,$gps.ms,$sb.ms)
$maxVal = [math]::Max(1, ($vals | Measure-Object -Maximum).Maximum)
$mean   =  ($vals | Measure-Object -Average).Average
$sumSq  =  ($vals | ForEach-Object { ($_-$mean)*($_-$mean) } | Measure-Object -Sum).Sum
$stddev = [math]::Sqrt($sumSq / [math]::Max(1,$vals.Count))
$Comega = [math]::Round((1 - ($stddev / $maxVal)),4)
Log ("CΩ (coeficiente de convergência): {0}" -f $Comega) "Cyan"

# 3) Barras ASCII
Log "Gráfico ASCII de latência (maior barra = maior diferença):" "Gray"
Log ("[Domínio ] " + (Show-Bar $d1)) "Gray"
Log ("[GPS     ] " + (Show-Bar $d3)) "Gray"
Log ("[Supabase] " + (Show-Bar $d2)) "Gray"

# 4) CSV + Log
$payload = [PSCustomObject]@{
  timestamp             = (Get-Date).ToUniversalTime().ToString("o")
  dominio_ms            = $dom.ms
  gps_ms                = $gps.ms
  supabase_ms           = $sb.ms
  asym_dom_gps          = $d1
  asym_dom_supabase     = $d2
  asym_gps_supabase     = $d3
  convergence           = $Comega
}
$csvFile = Join-Path $LogsDir ("deploy_metrics_v2.6_{0}.csv" -f (Get-Date -Format "yyyy-MM-dd_HH-mm-ss"))
$payload | Export-Csv -Path $csvFile -NoTypeInformation -Encoding UTF8
Log "Resultados exportados em: $csvFile" "Green"

# 5) Popup interativo para decidir envio
$popupTxt = "Dom: $($dom.ms)ms | GPS: $($gps.ms)ms | SB: $($sb.ms)ms`nAssimetria D-G: $d1% / D-S: $d2% / G-S: $d3%`nCΩ: $Comega`n`nDeseja ENVIAR este registro ao Supabase?"
$ans = Show-Popup $popupTxt
if($ans -eq "Yes"){
  $ins = Insert-SupabaseRecord -payload $payload
  if($ins.ok){ Log "Registro enviado ao Supabase (tabela $SUPABASE_TABLE)." "Green" }
  else       { Log "Falha ao inserir no Supabase: $($ins.error)" "Yellow" }
}else{
  Log "Envio ao Supabase cancelado pelo operador." "Yellow"
}

# 6) Scheduler (05:30 e 17:30)
$TaskName = "PecuariaTech-Monitor-GPS-v2.6"
try{
  if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
    $trig1 = New-ScheduledTaskTrigger -Daily -At "05:30"
    $trig2 = New-ScheduledTaskTrigger -Daily -At "17:30"
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trig1,$trig2 -RunLevel Highest -Force | Out-Null
    Log "Agendamento criado: $TaskName (05:30 e 17:30)" "Green"
  } else {
    Log "Agendamento já existe: $TaskName" "Gray"
  }
} catch {
  Log "Não foi possível criar agendamento (permite continuar): $($_.Exception.Message)" "Yellow"
}

# 7) Fim
$dur = [math]::Round((New-TimeSpan -Start $start -End (Get-Date)).TotalSeconds,2)
Log ("Tempo total: {0} s" -f $dur) "Cyan"
Log "Verificação concluída." "Green"