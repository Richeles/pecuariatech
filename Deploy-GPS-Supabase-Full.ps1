<#
Script: Deploy-GPS-Supabase-Full.ps1
Versão: v1.2 (corrigida e testada)
Funções: 
 - Testa domínio, GPS e Supabase
 - Gera CSV e popup
 - Faz upload automático
 - Agenda verificação
#>

param([switch]$AutoUpload,[switch]$ShowPopup,[switch]$Schedule)

#================ FUNÇÕES =================#

function Log {
  param([string]$msg,[string]$color="White")
  $t=(Get-Date).ToString("HH:mm:ss")
  Write-Host "$t | $msg" -ForegroundColor $color
}

function Show-Popup {
  param([string]$title,[string]$body)
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($body,$title,"OK","Information") | Out-Null
  } catch {
    Write-Host "Falha ao exibir popup: $($_.Exception.Message)"
  }
}

function Test-Endpoint {
  param($url,$method="GET",$timeout=10)
  try {
    $sw=[Diagnostics.Stopwatch]::StartNew()
    $r=Invoke-WebRequest -Uri $url -Method $method -UseBasicParsing -TimeoutSec $timeout -ErrorAction Stop
    $sw.Stop()
    return @{ok=$true;status=$r.StatusCode;ms=[math]::Round($sw.ElapsedMilliseconds,2)}
  } catch {
    return @{ok=$false;error=$_.Exception.Message;ms=0}
  }
}

function RelDiffPct {
  param([double]$a,[double]$b)
  if($a -eq 0 -and $b -eq 0){return 0}
  $mx=[Math]::Max($a,$b)
  if($mx -eq 0){return 0}
  return [math]::Round(([math]::Abs($a-$b)/$mx)*100,2)
}

function Show-Bar {
  param([double]$val,[int]$width=20)
  $filled=[int]([math]::Round(($val/100)*$width))
  $arr=@()
  for($i=0;$i -lt $width;$i++){ $arr+=$(if($i -lt $filled){"#"}else{"-"}) }
  return ($arr -join "")
}

function Insert-SupabaseRecord($payload) {
  $url=[Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL","Machine")
  $key=[Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY","Machine")
  if(-not $url -or -not $key){return @{ok=$false;error="Chaves ausentes"}}
  try {
    $h=@{"apikey"=$key;"Authorization"="Bearer $key";"Content-Type"="application/json"}
    $body=@($payload)|ConvertTo-Json -Depth 5
    $r=Invoke-RestMethod -Uri "$url/rest/v1/monitor_gps" -Method POST -Headers $h -Body $body -ErrorAction Stop
    return @{ok=$true;data=$r}
  } catch {
    return @{ok=$false;error=$_.Exception.Message}
  }
}

#================ EXECUÇÃO =================#

$start=Get-Date
$proj="C:\Users\Administrador\pecuariatech"
$logs=Join-Path $proj "logs"
if(-not(Test-Path $logs)){mkdir $logs|Out-Null}

$dom="https://www.pecuariatech.com"
$gps="$dom/api/sensor"
$sbUrl=[Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL","Machine")

Log "Iniciando verificação..." "Cyan"

$d=Test-Endpoint $dom
$g=Test-Endpoint $gps "POST"
if(-not $g.ok -and $g.error -match "405"){$g=Test-Endpoint $gps "GET"}
$s=Test-Endpoint $sbUrl

if($d.ok){Log "Domínio OK: $($d.status) - $($d.ms)ms" "Green"}else{Log "Erro domínio: $($d.error)" "Red"}
if($g.ok){Log "GPS OK: $($g.status) - $($g.ms)ms" "Green"}else{Log "Erro GPS: $($g.error)" "Yellow"}
if($s.ok){Log "Supabase OK: $($s.status) - $($s.ms)ms" "Green"}else{Log "Erro Supabase: $($s.error)" "Yellow"}

$d1=RelDiffPct $d.ms $g.ms
$d2=RelDiffPct $d.ms $s.ms
$d3=RelDiffPct $g.ms $s.ms

$v=@($d.ms,$g.ms,$s.ms)
$max=[math]::Max(1,($v|Measure-Object -Maximum).Maximum)
$mean=($v|Measure-Object -Average).Average
$std=[math]::Sqrt((($v|ForEach-Object{($_-$mean)*($_-$mean)}|Measure-Object -Sum).Sum)/$v.Count)
$c=[math]::Round((1-($std/$max)),4)

Log "Assimetria e convergência:"
Log "Domínio vs GPS: $d1%"
Log "Domínio vs Supabase: $d2%"
Log "GPS vs Supabase: $d3%"
Log "CΩ: $c" "Cyan"

Log "[Domínio ] $(Show-Bar $d1)"
Log "[GPS     ] $(Show-Bar $d3)"
Log "[Supabase] $(Show-Bar $d2)"

$p=[PSCustomObject]@{
 timestamp=(Get-Date).ToUniversalTime().ToString("o")
 dom_ms=$d.ms; gps_ms=$g.ms; sup_ms=$s.ms
 asym_d_g=$d1; asym_d_s=$d2; asym_g_s=$d3; conv=$c
}

$csv=Join-Path $logs ("gps_metrics_{0}.csv" -f (Get-Date -Format "yyyy-MM-dd_HH-mm-ss"))
$p | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $csv
Log "CSV salvo: $csv" "Green"

if($AutoUpload){
 $r=Insert-SupabaseRecord -payload $p
 if($r.ok){Log "Upload OK." "Green"}else{Log "Falha upload: $($r.error)" "Yellow"}
}

if($ShowPopup){
 $title="PecuariaTech - Monitor GPS"
 $body="Domínio: $($d.status)/$($d.ms)ms`nGPS: $($g.status)/$($g.ms)ms`nSupabase: $(if($s.ok){$s.status}else{'ERR'})/$($s.ms)ms`nCΩ: $c"
 Show-Popup $title $body
}

if($Schedule){
 $task="PecuariaTech-Monitor"
 if(-not(Get-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue)){
  $exe=(Get-Command powershell.exe).Source
  $act=New-ScheduledTaskAction -Execute $exe -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$proj\Deploy-GPS-Supabase-Full.ps1`" -AutoUpload -ShowPopup"
  $t1=New-ScheduledTaskTrigger -Daily -At "06:00"
  $t2=New-ScheduledTaskTrigger -Daily -At "18:00"
  Register-ScheduledTask -TaskName $task -Action $act -Trigger $t1,$t2 -RunLevel Highest -Force
  Log "Agendamento criado: $task" "Green"
 } else {
  Log "Agendamento já existente." "Gray"
 }
}

$dur=[math]::Round(((Get-Date) - $start).TotalSeconds,2)
Log "Tempo total: $dur s" "Cyan"
Log "Verificação concluída." "Green"
