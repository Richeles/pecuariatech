# ─────────────────────────────────────────────────────────────
#  PecuariaTech · Ultrabiológica Tri360 Integrator (αβγΩ)
#  PowerShell 7 – sincroniza Terminal ⇄ Next.js ⇄ Supabase
# ─────────────────────────────────────────────────────────────

param(
  [int]$IntervaloSeg = 5,                    # intervalo de leitura/integração
  [switch]$VerboseSupabase                   # logar payloads do Supabase
)

$ErrorActionPreference = "SilentlyContinue"
$root     = "C:\Users\Administrador\pecuariatech"
$dataFile = Join-Path $root "data\tri360_state.json"
$logFile  = Join-Path $root "tri360_integrator_log.txt"
$envFile  = Join-Path $root ".env.local"

# ===== helpers =====
function Write-Utf8NoBom([string]$path, [string]$text) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $enc)
}
function Log([string]$msg, [ConsoleColor]$color = [ConsoleColor]::Gray) {
  $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  $line = "[$ts] $msg"
  Add-Content -Path $logFile -Value $line
  $orig = $Host.UI.RawUI.ForegroundColor
  $Host.UI.RawUI.ForegroundColor = $color
  Write-Host $line
  $Host.UI.RawUI.ForegroundColor = $orig
}
function Read-EnvFile([string]$path) {
  $pairs = @{}
  if (-not (Test-Path $path)) { return $pairs }
  Get-Content $path | ForEach-Object {
    if ($_ -match "^(?<k>[^=]+)=(?<v>.+)$") {
      $k = $Matches.k.Trim(); $v = $Matches.v.Trim()
      $pairs[$k] = $v
    }
  }
  return $pairs
}

# ===== carregar variáveis do Supabase =====
$envs = Read-EnvFile $envFile
$SUPABASE_URL = $envs["NEXT_PUBLIC_SUPABASE_URL"]
$SUPABASE_KEY = $envs["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

if ([string]::IsNullOrWhiteSpace($SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($SUPABASE_KEY)) {
  Log "⚠️ Variáveis do Supabase ausentes em .env.local (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)." 'Yellow'
  Log "   Integração com Supabase ficará desativada; apenas sincronização local." 'Yellow'
}

# ===== garantir arquivo de estado =====
if (-not (Test-Path $dataFile)) {
  $seed = @"
{
  "alpha": 0.95,
  "beta": 0.82,
  "gamma": 0.85,
  "omega": 0.87,
  "threshold": 0.85,
  "cycle": 1,
  "last_update": "$(Get-Date -Format "HH:mm:ss")",
  "history": [0.86, 0.87, 0.85, 0.88, 0.89]
}
"@
  Write-Utf8NoBom $dataFile $seed
  Log "🧩 Arquivo de estado sem histórico encontrado — criado seed em data/tri360_state.json" 'DarkYellow'
}

# ===== função: postar log no Supabase (tolerante a falhas) =====
function Post-SupabaseLog($url, $key, $alpha, $beta, $gamma, $omega, $threshold, $cycle, $ok, $msg) {
  if ([string]::IsNullOrWhiteSpace($url) -or [string]::IsNullOrWhiteSpace($key)) { return $false }
  $payloadObj = [ordered]@{
    data_execucao        = (Get-Date).ToString("o")
    arquivos_verificados = 0
    arquivos_corrigidos  = 0
    arquivos_padronizados= 0
    sucesso              = $ok
    mensagem             = $msg
    # metadados tri360 úteis (colunas extras serão ignoradas se não existirem)
    tri_alpha            = [Math]::Round($alpha,3)
    tri_beta             = [Math]::Round($beta,3)
    tri_gamma            = [Math]::Round($gamma,3)
    tri_omega            = [Math]::Round($omega,3)
    tri_threshold        = [Math]::Round($threshold,3)
    tri_cycle            = $cycle
  }
  $json = $payloadObj | ConvertTo-Json -Depth 5

  if ($VerboseSupabase) {
    Log ("γ→ Supabase payload: " + $json) 'DarkGray'
  }

  try {
    Invoke-RestMethod -Uri "$url/rest/v1/logs_reparo" `
      -Headers @{ apikey = $key; Authorization = "Bearer $key"; "Content-Type" = "application/json"; Prefer = "return=minimal" } `
      -Method Post -Body $json | Out-Null
    return $true
  } catch {
    Log ("γ→ Supabase ignorado: " + $_.Exception.Message) 'DarkYellow'
    return $false
  }
}

# ===== loop de integração =====
Clear-Host
Log "🔗 Iniciando Ultrabiológica Tri360 Integrator (αβγΩ) — intervalo=${IntervaloSeg}s" 'Cyan'
$lastCycle = -1

while ($true) {
  try {
    $raw = Get-Content -Raw -Path $dataFile
    $state = $raw | ConvertFrom-Json
  } catch {
    Log "❌ Falha ao ler state: $($_.Exception.Message)" 'Red'
    Start-Sleep -Seconds $IntervaloSeg
    continue
  }

  # normalizar (garante campos)
  $now = Get-Date -Format "HH:mm:ss"
  if (-not $state.alpha)     { $state | Add-Member -NotePropertyName "alpha" -NotePropertyValue 0.9 -Force }
  if (-not $state.beta)      { $state | Add-Member -NotePropertyName "beta" -NotePropertyValue 0.8 -Force }
  if (-not $state.gamma)     { $state | Add-Member -NotePropertyName "gamma" -NotePropertyValue 0.85 -Force }
  if (-not $state.omega)     { $state | Add-Member -NotePropertyName "omega" -NotePropertyValue [Math]::Round(($state.alpha+$state.beta+$state.gamma)/3,3) -Force }
  if (-not $state.threshold) { $state | Add-Member -NotePropertyName "threshold" -NotePropertyValue 0.85 -Force }
  if (-not $state.cycle)     { $state | Add-Member -NotePropertyName "cycle" -NotePropertyValue 1 -Force }
  $state.last_update = $now

  # regrava state (mantém JSON coerente p/ /api/ultra/stats)
  try {
    Write-Utf8NoBom $dataFile ($state | ConvertTo-Json -Depth 6)
  } catch {
    Log "⚠️ Não consegui regravar state (sem impacto): $($_.Exception.Message)" 'DarkYellow'
  }

  # só publica no Supabase quando o ciclo avança (evita flood)
  if ($state.cycle -ne $lastCycle) {
    $ok = [bool]($state.omega -ge $state.threshold)
    $msg = "tri360 integrator: ciclo $($state.cycle), Ω=$([Math]::Round($state.omega,3))"

    $posted = Post-SupabaseLog $SUPABASE_URL $SUPABASE_KEY `
               $state.alpha $state.beta $state.gamma $state.omega $state.threshold $state.cycle $ok $msg

    if ($posted) {
      Log ("γ✓ Supabase log registrado · ciclo=$($state.cycle) · Ω=$([Math]::Round($state.omega,3)) · status=" + ($ok ? "estável" : "oscilação")) ($ok ? 'Green' : 'Yellow')
    } else {
      Log ("γ… Supabase indisponível (mantido local) · ciclo=$($state.cycle) · Ω=$([Math]::Round($state.omega,3))") 'DarkYellow'
    }

    $lastCycle = [int]$state.cycle
  } else {
    Log ("Ω heartbeat · ciclo=$($state.cycle) · Ω=$([Math]::Round($state.omega,3))") 'DarkGray'
  }

  Start-Sleep -Seconds $IntervaloSeg
}
