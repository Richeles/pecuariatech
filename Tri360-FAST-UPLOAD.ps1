param(
  [string]$SourcePath = "C:\Users\Administrador\pecuariatech\out",
  [string]$Include = "*.json",
  [switch]$Recursive,
  [switch]$DryRun,
  [switch]$DeleteOnSuccess,
  [switch]$ShowPulse,
  [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

# Variáveis do ambiente
$BASE   = $env:TRI360_BASE;       if (-not $BASE)   { $BASE = "https://www.pecuariatech.com" }
$TOKEN  = $env:TRI360_WEBHOOK_TOKEN
$DEVICE = $env:TRI360_DEVICE_ID;  if (-not $DEVICE) { $DEVICE = "UBI-TRI360-DEFAULT" }
if (-not $TOKEN) { throw "Defina TRI360_WEBHOOK_TOKEN no ambiente Windows (Machine)." }

$ENDPOINT = "$BASE/api/tri360/logs"
$headers = @{ "Authorization"="Bearer $TOKEN"; "Content-Type"="application/json" }

function Render-PulseBar {
  param([double]$Omega,[double]$Threshold,[Nullable[Double]]$Proj,[int]$Segments=20)
  $empty=[char]0x2591; $full=[char]0x2588; $thCh=[char]0x2502; $prCh=[char]0x25C6
  if ($Omega -lt 0){$Omega=0}elseif($Omega -gt 1){$Omega=1}
  if ($Threshold -lt 0){$Threshold=0}elseif($Threshold -gt 1){$Threshold=1}
  $bar = New-Object System.Collections.Generic.List[char]
  for($i=0;$i -lt $Segments;$i++){ $bar.Add($empty) }
  $oPos  = [int][Math]::Round($Omega     * ($Segments-1))
  $thPos = [int][Math]::Round($Threshold * ($Segments-1))
  for($i=0;$i -le $oPos;$i++){ $bar[$i]=$full }
  if ($thPos -ge 0 -and $thPos -lt $Segments){ $bar[$thPos]=$thCh }
  if ($Proj -ne $null){
    if ($Proj -lt 0){$Proj=0}elseif($Proj -gt 1){$Proj=1}
    $pPos = [int][Math]::Round($Proj * ($Segments-1))
    if ($pPos -eq $thPos) {
      $alt = if ($thPos+1 -lt $Segments) { $thPos+1 } else { $thPos-1 }
      if ($alt -ge 0 -and $alt -lt $Segments) { $bar[$alt] = $thCh }
    }
    $bar[$pPos] = $prCh
  }
  return -join $bar
}

function To-Payload {
  param([pscustomobject]$obj, [string]$fallbackDevice, [string]$file)
  $dev = if ($obj.device_id) { [string]$obj.device_id } else { $fallbackDevice }
  $alpha = if ($obj.tri_alpha) { [double]$obj.tri_alpha } else { [double]$obj.alpha }
  $beta  = if ($obj.tri_beta)  { [double]$obj.tri_beta  } else { [double]$obj.beta }
  $gamma = if ($obj.tri_gamma) { [double]$obj.tri_gamma } else { [double]$obj.gamma }
  $omega = if ($obj.tri_omega) { [double]$obj.tri_omega } else { [double]$obj.omega }
  $thres = if ($obj.tri_threshold){[double]$obj.tri_threshold}else{ [double]$obj.threshold }
  $cycle = if ($obj.tri_cycle) { [int]$obj.tri_cycle } else { [int]$obj.cycle }
  if (-not $cycle) { $cycle = 1 }
  $at = if ($obj.at) { [string]$obj.at } else { (Get-Item $file).LastWriteTime.ToString("o") }

  return [ordered]@{
    device_id     = $dev
    tri_alpha     = $alpha
    tri_beta      = $beta
    tri_gamma     = $gamma
    tri_omega     = $omega
    tri_threshold = $thres
    tri_cycle     = $cycle
    at            = $at
  }
}

function Post-Once { param([hashtable]$payload)
  $json = $payload | ConvertTo-Json -Depth 6
  return Invoke-RestMethod -Method POST -Uri $ENDPOINT -Headers $headers -Body $json -TimeoutSec 30
}

# Coleta de arquivos
$files = if ($Recursive) {
  Get-ChildItem -Path $SourcePath -Filter $Include -File -Recurse | Sort-Object LastWriteTime
} else {
  Get-ChildItem -Path $SourcePath -Filter $Include -File | Sort-Object LastWriteTime
}
if (-not $files -or $files.Count -eq 0) { Write-Host "Nenhum arquivo encontrado em $SourcePath ($Include)." -ForegroundColor Yellow; exit 0 }

$ok=0; $fail=0; $failed=@()
foreach($f in $files){
  try{
    $obj = Get-Content $f.FullName -Raw | ConvertFrom-Json
    $payload = To-Payload -obj $obj -fallbackDevice $DEVICE -file $f.FullName

    if ($DryRun){
      if ($Verbose){ Write-Host ("DRYRUN → {0}" -f $f.Name) -ForegroundColor DarkCyan }
    } else {
      try {
        $resp = Post-Once -payload $payload
      } catch {
        $webResp = $_.Exception.Response
        $code = 0; try { $code = [int]$webResp.StatusCode } catch {}
        if ($webResp -and $code -eq 429) {
          $retryAfter = 10
          try { $ra = $webResp.Headers["Retry-After"]; if ($ra) { $retryAfter = [int]$ra } } catch {}
          if ($Verbose){ Write-Host ("429: aguardando {0}s..." -f $retryAfter) -ForegroundColor Yellow }
          Start-Sleep -Seconds $retryAfter
          $resp = Post-Once -payload $payload
        } else {
          if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message -ForegroundColor DarkYellow }
          throw
        }
      }

      if ($Verbose){
        $projEf = if ($resp.projecao_omega){ [double]$resp.projecao_omega } else { $null }
        $bar = if ($ShowPulse){ Render-PulseBar -Omega $payload.tri_omega -Threshold $payload.tri_threshold -Proj $projEf } else { $null }
        $line = "OK → {0} · id={1} · risco={2}" -f $f.Name, ($resp.id ?? '—'), ($resp.risco ?? '—')
        if ($ShowPulse -and $bar){ $line += (" · [{0}]" -f $bar) }
        Write-Host $line -ForegroundColor Green
      }
    }

    if ($DeleteOnSuccess -and -not $DryRun) { Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue }
    $ok++
  } catch {
    $fail++; $failed += $f.FullName
    Write-Host ("FALHA → {0} :: {1}" -f $f.Name, $_.Exception.Message) -ForegroundColor Red
  }
}

Write-Host ("Resumo: enviados={0}, falhas={1}" -f $ok,$fail)
if ($failed.Count -gt 0) {
  Write-Host "Arquivos com falha:" -ForegroundColor Red
  $failed | ForEach-Object { Write-Host " - $_" }
}
exit 0
