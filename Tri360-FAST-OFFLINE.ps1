param(
  [switch]$Verbose,
  [int]$Cycle = 1,
  [double]$Alpha = 0.123,
  [double]$Beta  = 0.234,
  [double]$Gamma = 0.345,
  [double]$Omega = [double]::NaN,     # se não passar, usa média α,β,γ
  [double]$Threshold = 0.750,
  [double]$DeltaOmega = 0.00,         # ΔΩ(10) fornecido manualmente p/ OFFLINE
  [int]$Segments = 20,
  [string]$OutJson = ""               # opcional: caminho para salvar JSON do relatório
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

# --------- Utilitários ---------
function Num([object]$n) {
  if ($null -eq $n -or [double]::IsNaN([double]$n)) { 'n/a' }
  else { ([double]$n).ToString('0.000', [Globalization.CultureInfo]::InvariantCulture) }
}

function Classificar-Risco([double]$proj,[double]$thr,[double]$delta){
  if ($proj -ge $thr) { return 'ALTO' }
  elseif ( ($thr - $proj) -le [Math]::Abs($delta) * 5 ) { return 'MÉDIO' }
  else { return 'BAIXO' }
}

# Barra Ω (Unicode seguro; resolve empate projeção==threshold deslocando o threshold)
function Render-PulseBar {
  param([double]$Omega,[double]$Threshold,[Nullable[Double]]$Proj,[int]$Segments=20)
  if ($Omega -lt 0){$Omega=0}elseif($Omega -gt 1){$Omega=1}
  if ($Threshold -lt 0){$Threshold=0}elseif($Threshold -gt 1){$Threshold=1}
  $empty=[char]0x2591; $full=[char]0x2588; $thCh=[char]0x2502; $prCh=[char]0x25C6
  $bar = New-Object System.Collections.Generic.List[char]
  for($i=0;$i -lt $Segments;$i++){ $bar.Add($empty) }
  $oPos  = [int][Math]::Round($Omega     * ($Segments-1))
  $thPos = [int][Math]::Round($Threshold * ($Segments-1))
  for($i=0;$i -le $oPos;$i++){ $bar[$i]=$full }   # preenche Ω
  if ($thPos -ge 0 -and $thPos -lt $Segments){ $bar[$thPos]=$thCh }  # marca threshold
  if ($Proj -ne $null){
    if ($Proj -lt 0){$Proj=0}elseif($Proj -gt 1){$Proj=1}
    $pPos = [int][Math]::Round($Proj * ($Segments-1))
    if ($pPos -eq $thPos) {
      $alt = if ($thPos+1 -lt $Segments) { $thPos+1 } else { $thPos-1 }
      if ($alt -ge 0 -and $alt -lt $Segments) { $bar[$alt] = $thCh }
    }
    $bar[$pPos] = $prCh                           # projeção (sobrepõe Ω)
  }
  return -join $bar
}

# --------- Cálculos ---------
if ([double]::IsNaN($Omega)) { $Omega = [Math]::Round( ($Alpha + $Beta + $Gamma) / 3.0, 6 ) }
$Proj = [double]$Omega + [double]$DeltaOmega
$Risco = Classificar-Risco -proj $Proj -thr $Threshold -delta $DeltaOmega
$Bar = Render-PulseBar -Omega $Omega -Threshold $Threshold -Proj $Proj -Segments $Segments
$now = Get-Date

# --------- Relatório ---------
Write-Host ""
Write-Host "┌──────────── Tri360-FAST OFFLINE ────────────"
Write-Host ("│ Ciclo       : {0}" -f $Cycle)
Write-Host ("│ α,β,γ       : {0}, {1}, {2}" -f (Num $Alpha), (Num $Beta), (Num $Gamma))
Write-Host ("│ Ω / Th      : {0} / {1}" -f (Num $Omega), (Num $Threshold))
Write-Host ("│ ΔΩ(10)      : {0}" -f (Num $DeltaOmega))
Write-Host ("│ Projeção Ω  : {0}" -f (Num $Proj))
switch ($Risco) {
  'ALTO'  { Write-Host "│ Risco       : ALTO"  -ForegroundColor Red }
  'MÉDIO' { Write-Host "│ Risco       : MÉDIO" -ForegroundColor Yellow }
  default { Write-Host "│ Risco       : BAIXO" -ForegroundColor Green }
}
Write-Host ("│ Ω Pulse     : [{0}]" -f $Bar)
Write-Host "└────────────────────────────────────────────"
if ($Verbose) { Write-Host "✓ Execução OFFLINE concluída." -ForegroundColor Green }

# --------- Saída opcional em JSON ---------
if ($OutJson -and $OutJson.Trim().Length -gt 0) {
  $obj = [ordered]@{
    device_id     = "OFFLINE"
    cycle         = $Cycle
    alpha         = [double]$Alpha
    beta          = [double]$Beta
    gamma         = [double]$Gamma
    omega         = [double]$Omega
    threshold     = [double]$Threshold
    delta_omega_10= [double]$DeltaOmega
    projecao_omega= [double]$Proj
    risco         = $Risco
    at            = $now.ToString("o")
    pulse_bar     = $Bar
  }
  $json = ($obj | ConvertTo-Json -Depth 6)
  $dir = Split-Path -Path $OutJson -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  Set-Content -Path $OutJson -Value $json -Encoding UTF8
  if ($Verbose) { Write-Host ("✓ JSON salvo em: {0}" -f $OutJson) -ForegroundColor Cyan }
}
