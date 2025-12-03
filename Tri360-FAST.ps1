param(
  [switch]$Verbose,
  [int]$Cycle,                         # ciclo atual (se omitir, usa 1)
  [double]$Alpha = 0.123,
  [double]$Beta = 0.234,
  [double]$Gamma = 0.345,
  [double]$Omega = [double]::NaN,      # se omitir, usa média α,β,γ
  [double]$Threshold = 0.750
)

$ErrorActionPreference = "Stop"
$ProgressPreference    = "SilentlyContinue"
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

# Ambiente do seu domínio
$BASE   = $env:TRI360_BASE;       if (-not $BASE)   { $BASE   = "https://www.pecuariatech.com" }
$TOKEN  = $env:TRI360_WEBHOOK_TOKEN
$DEVICE = $env:TRI360_DEVICE_ID;  if (-not $DEVICE) { $DEVICE = "UBI-TRI360-DEFAULT" }
if (-not $TOKEN) { throw "Defina TRI360_WEBHOOK_TOKEN no ambiente Windows (Machine)." }

$ENDPOINT_POST = "$BASE/api/tri360/logs"
$ENDPOINT_GET  = "$BASE/api/tri360/last?device_id=$($DEVICE)&limit=10"

# Defaults rápidos
if (-not $Cycle -or $Cycle -le 0) { $Cycle = 1 }
if ([double]::IsNaN($Omega)) { $Omega = [Math]::Round(($Alpha + $Beta + $Gamma) / 3, 3) }

# ---------- Funções utilitárias ----------
function Post-JSON {
  param([string]$Uri, [hashtable]$Body, [hashtable]$Headers, [int]$Timeout=30)
  $json = $Body | ConvertTo-Json -Depth 6
  return Invoke-RestMethod -Method POST -Uri $Uri -Headers $Headers -Body $json -TimeoutSec $Timeout
}
function Get-JSON {
  param([string]$Uri, [int]$Timeout=20)
  return Invoke-RestMethod -Method GET -Uri $Uri -TimeoutSec $Timeout
}
function Num($n) { if ($null -eq $n -or [double]::IsNaN([double]$n)) { '—' } else { '{0:0.000}' -f [double]$n } }

# Barra de pulso Ω (ASCII/Unicode)
function Render-PulseBar {
  param([double]$Omega,[double]$Threshold,[Nullable[Double]]$Proj)

  $segments = 20
  $clamp = { param($x) [Math]::Max(0,[Math]::Min(1,[double]$x)) }
  $o  = & $clamp $Omega
  $th = & $clamp $Threshold
  $p  = $null
  if ($Proj -ne $null) { $p = & $clamp $Proj }

  $bar = New-Object System.Collections.Generic.List[char]
  for ($i=0;$i -lt $segments;$i++){ $bar.Add([char]'░') }   # vazio

  $oPos  = [int][Math]::Round($o  * ($segments-1))
  $thPos = [int][Math]::Round($th * ($segments-1))
  $pPos  = if ($p -ne $null) { [int][Math]::Round($p * ($segments-1)) } else { -1 }

  # preenche Ω
  for($i=0;$i -le $oPos;$i++){ $bar[$i] = [char]'█' }
  # marca threshold
  $bar[$thPos] = [char]'│'
  # marca projeção (se existir) — prioridade sobre os outros
  if ($pPos -ge 0) { $bar[$pPos] = [char]'◆' }

  return ($bar.ToArray() -join '')
}

# ---------- Coleta atual ----------
$now = Get-Date
$payload = [ordered]@{
  device_id     = $DEVICE
  tri_alpha     = $Alpha
  tri_beta      = $Beta
  tri_gamma     = $Gamma
  tri_omega     = $Omega
  tri_threshold = $Threshold
  tri_cycle     = $Cycle
  at            = $now.ToString("o")
}

# ---------- ΔΩ(10) & Projeção (stateless) ----------
$delta10 = $null; $proj = $null; $riscoLocal = $null
try {
  $hist = Get-JSON -Uri $ENDPOINT_GET
  if ($hist.ok -and $hist.items.Count -gt 0) {
    # pega o mais antigo dentre os ~10 recentes ANTES do ciclo atual
    $ordered = $hist.items | Sort-Object tri_cycle
    $prev = $ordered | Where-Object { $_.tri_cycle -lt $Cycle }
    if ($prev.Count -gt 0) {
      $oldest = $prev[0]
      $dc = [int]($Cycle - [int]$oldest.tri_cycle)
      if ($dc -le 0) { $dc = 1 }
      $delta10 = ([double]$Omega - [double]$oldest.tri_omega) / $dc
      $proj    = [double]$Omega + $delta10
    }
  }
} catch {
  # sem histórico ou rota indisponível → segue sem ΔΩ/projeção locais (servidor calcula)
}

# risco local (fallback coerente com servidor)
if ($proj -ne $null) {
  if ($proj -ge $Threshold) { $riscoLocal = 'alto' }
  elseif ( ($Threshold - $proj) -le [Math]::Abs($delta10) * 5 ) { $riscoLocal = 'medio' }
  else { $riscoLocal = 'baixo' }
} else {
  $riscoLocal = if ($Omega -ge $Threshold) { 'alto' }
                elseif ( ($Threshold - $Omega) -le 0.05 ) { 'medio' }
                else { 'baixo' }
}

# ---------- Envio ao seu domínio ----------
$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

try {
  $resp = Post-JSON -Uri $ENDPOINT_POST -Body $payload -Headers $headers
} catch {
  # 429: respeita Retry-After e tenta 1x
  $webResp = $_.Exception.Response
  $code = 0; try { $code = [int]$webResp.StatusCode } catch {}
  if ($webResp -and $code -eq 429) {
    $retryAfter = 10
    try { $ra = $webResp.Headers["Retry-After"]; if ($ra) { $retryAfter = [int]$ra } } catch {}
    Write-Host ("⚠ Rate limited, aguardando {0}s..." -f $retryAfter) -ForegroundColor Yellow
    Start-Sleep -Seconds $retryAfter
    $resp = Post-JSON -Uri $ENDPOINT_POST -Body $payload -Headers $headers
  } else {
    if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message -ForegroundColor DarkYellow }
    throw
  }
}

# ---------- Relatório técnico ----------
$idResp = if ($resp.id) { $resp.id } else { '—' }
$risco  = if ($resp.risco) { $resp.risco } else { $riscoLocal }
$projEf = if ($resp.projecao_omega) { [double]$resp.projecao_omega } else { $proj }

Write-Host ""
Write-Host "┌────────────────── Tri360‑FAST Ω+ · Relatório ──────────────────" -ForegroundColor Cyan
Write-Host ("│ Dispositivo : {0}" -f $DEVICE)
Write-Host ("│ Data/Hora   : {0}" -f (Get-Date).ToString("g"))
Write-Host ("│ Ciclo       : {0}" -f $Cycle)
Write-Host ("│ α,β,γ       : {0}, {1}, {2}" -f (Num $Alpha), (Num $Beta), (Num $Gamma))
Write-Host ("│ Ω / Th      : {0} / {1}" -f (Num $Omega), (Num $Threshold))
Write-Host ("│ ΔΩ(10)      : {0}" -f (Num $delta10))
Write-Host ("│ Projeção Ω  : {0}" -f (Num $projEf))
switch ($risco) {
  'alto'  { Write-Host ("│ Risco       : ALTO")  -ForegroundColor Red }
  'medio' { Write-Host ("│ Risco       : MÉDIO") -ForegroundColor Yellow }
  default { Write-Host ("│ Risco       : BAIXO") -ForegroundColor Green }
}
Write-Host ("│ ID registro : {0}" -f $idResp)

# Barra de pulso Ω (sempre ao final)
$bar = Render-PulseBar -Omega $Omega -Threshold $Threshold -Proj $projEf
Write-Host ("│ Ω Pulse     : [{0}]" -f $bar)
Write-Host "└───────────────────────────────────────────────────────────────" -ForegroundColor Cyan

if ($Verbose) {
  Write-Host ("γ✓ POST OK · id={0} · risco={1} · proj={2}" -f $idResp, $risco, (Num $projEf)) -ForegroundColor Green
}
exit 0
