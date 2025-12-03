<#
  ┌────────────────────────────────────────────────────────────┐
  │      ULTRABIOLÓGICA TRI360 Ω+ — MONITOR TERMINAL v1.0      │
  │      PowerShell 7 | Aprendizado fractal e estabilidade      │
  └────────────────────────────────────────────────────────────┘
#>

$ErrorActionPreference = "SilentlyContinue"
$path = "C:\Users\Administrador\pecuariatech"
$stateFile = Join-Path $path "tri360_state.json"
$logFile   = Join-Path $path "tri360_terminal_log.txt"

# === utilidades ===
function Write-Utf8NoBom([string]$file, [string]$text) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($file, $text, $enc)
}
function Log($msg, [ConsoleColor]$color = [ConsoleColor]::Gray) {
  $ts = (Get-Date).ToString("HH:mm:ss")
  $line = "[$ts] $msg"
  Add-Content -Path $logFile -Value $line
  $orig = $Host.UI.RawUI.ForegroundColor
  $Host.UI.RawUI.ForegroundColor = $color
  Write-Host $line
  $Host.UI.RawUI.ForegroundColor = $orig
}

# === carregar estado fractal ===
if (Test-Path $stateFile) {
  try { $state = Get-Content -Raw $stateFile | ConvertFrom-Json } catch { $state = $null }
}
if (-not $state) {
  $state = [pscustomobject]@{
    stableThreshold = 0.85
    history = @()
  }
}

# === função para gerar valores fractais αβγΩ ===
function New-FractalState {
  $α = [Math]::Round((Get-Random -Minimum 0.75 -Maximum 1.0),3)
  $β = [Math]::Round((Get-Random -Minimum 0.70 -Maximum 0.95),3)
  $γ = [Math]::Round((Get-Random -Minimum 0.72 -Maximum 0.98),3)
  $noise = (Get-Random -Minimum -0.03 -Maximum 0.03)
  $Ω = [Math]::Round((($α + $β + $γ)/3 + $noise),3)
  return [pscustomobject]@{ α=$α; β=$β; γ=$γ; Ω=$Ω; time=(Get-Date).ToString("HH:mm:ss") }
}

# === função para desenhar gráfico ASCII ===
function Show-Graph([double[]]$values) {
  $scale = 50
  $max = 1.0; $min = 0.7
  foreach ($v in $values[-$scale..-1]) {
    $pos = [Math]::Floor(($v - $min)/($max - $min) * 40)
    $bar = ("█" * $pos).PadRight(40,"░")
    Write-Host ("Ω {0:N3} |" -f $v) -NoNewline
    Write-Host $bar
  }
}

# === loop contínuo Tri360 ===
Clear-Host
Log "🚀 Iniciando Tri360 Monitoramento Terminal..." 'Cyan'
[int]$cycle = 0

while ($true) {
  $cycle++
  $fractal = New-FractalState
  $state.history += $fractal
  if ($state.history.Count -gt 100) { $state.history = $state.history[-100..-1] }

  $Ω = $fractal.Ω
  $stable = $Ω -ge $state.stableThreshold
  $color = if ($stable) { 'Green' } else { 'Red' }

  Clear-Host
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  Write-Host "   🌿 ULTRABIOLÓGICA TRI360 Ω+  |  Ciclo #$cycle"
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  Write-Host (" α = {0:N3}   β = {1:N3}   γ = {2:N3}   Ω = {3:N3}" -f $fractal.α,$fractal.β,$fractal.γ,$Ω) -ForegroundColor $color
  Write-Host " Threshold atual: $($state.stableThreshold)"
  Write-Host ""
  Show-Graph ($state.history | ForEach-Object { $_.Ω })
  Write-Host ""

  if ($stable) {
    Log ("Ω={0:N3} → estável" -f $Ω) 'Green'
    if ($state.stableThreshold -lt 0.95) { $state.stableThreshold += 0.01 }
  } else {
    Log ("Ω={0:N3} → oscilação detectada" -f $Ω) 'Red'
    if ($state.stableThreshold -gt 0.70) { $state.stableThreshold -= 0.01 }
  }

  $json = $state | ConvertTo-Json -Depth 5
  Write-Utf8NoBom $stateFile $json

  Write-Host ""
  Write-Host "⏳ Atualizando novamente em 5s..." -ForegroundColor DarkGray
  Start-Sleep -Seconds 5
}
