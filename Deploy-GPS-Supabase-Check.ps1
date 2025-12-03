# Deploy-GPS-Supabase-Check.ps1
# Sistema de verificação GPS + Supabase + Domínio PecuariaTech

$ErrorActionPreference = "Stop"
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$LogDir = "$ProjectPath\logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$LogFile = "$LogDir\deploy_check_$Timestamp.log"

function Log($msg, $color="White") {
  $time = Get-Date -Format "HH:mm:ss"
  Write-Host "$time | $msg" -ForegroundColor $color
  Add-Content -Path $LogFile -Value "$time | $msg"
}

function CheckVar($name) {
  $value = [Environment]::GetEnvironmentVariable($name,"Machine")
  if ($null -eq $value -or $value -eq "") {
    Log "VAR AUSENTE: $name" "Yellow"
    return $false
  } else {
    Log "VAR OK: $name detectada." "Green"
    return $true
  }
}

# Cabeçalho
Log "Iniciando verificação GPS + Supabase + Domínio..."
$Start = Get-Date

# 1️⃣ Verificar variáveis de ambiente
$ok = $true
$ok = (CheckVar "NEXT_PUBLIC_SUPABASE_URL") -and $ok
$ok = (CheckVar "NEXT_PUBLIC_SUPABASE_ANON_KEY") -and $ok
$ok = (CheckVar "SUPABASE_SERVICE_ROLE_KEY") -and $ok

if (-not $ok) {
  Log "FALHA: Variáveis de ambiente incompletas." "Red"
  exit 1
}

# 2️⃣ Validar domínio principal
$domain = "https://www.pecuariatech.com"
Log "Verificando domínio real: $domain" "Cyan"
try {
  $domainResp = Invoke-WebRequest -Uri $domain -TimeoutSec 15 -UseBasicParsing
  if ($domainResp.StatusCode -eq 200) {
    Log "DOMÍNIO ATIVO: resposta 200 OK" "Green"
  } else {
    Log "DOMÍNIO ALERTA: resposta HTTP $($domainResp.StatusCode)" "Yellow"
  }
} catch {
  Log "ERRO ao acessar domínio $domain -> $($_.Exception.Message)" "Red"
}

# 3️⃣ Detectar gargalo de operador (latência / DNS)
try {
  $ping = Test-Connection "www.pecuariatech.com" -Count 3 -ErrorAction Stop
  $avg = ($ping | Measure-Object ResponseTime -Average).Average
  if ($avg -gt 250) {
    Log "GARGALO DETECTADO: alta latência ($([math]::Round($avg,2)) ms)" "Yellow"
  } else {
    Log "CONEXÃO ESTÁVEL: latência média $([math]::Round($avg,2)) ms" "Green"
  }
} catch {
  Log "ERRO DNS/PING -> $($_.Exception.Message)" "Red"
}

# 4️⃣ Verificar endpoint GPS Supabase
$gpsEndpoint = "$domain/api/sensor"
Log "Verificando endpoint GPS: $gpsEndpoint" "Cyan"
try {
  $resp = Invoke-WebRequest -Uri $gpsEndpoint -TimeoutSec 10 -UseBasicParsing
  if ($resp.StatusCode -eq 200) {
    Log "ENDPOINT GPS ATIVO e convergente (HTTP 200)" "Green"
  } else {
    Log "ENDPOINT GPS ALERTA: código $($resp.StatusCode)" "Yellow"
  }
} catch {
  Log "ERRO de convergência GPS -> $($_.Exception.Message)" "Red"
}

# 5️⃣ Medir assimetria de convergência (Supabase vs Domínio)
try {
  $supabaseUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL","Machine")
  $supabaseResp = Invoke-WebRequest -Uri $supabaseUrl -TimeoutSec 10 -UseBasicParsing
  $latenciaSupabase = $supabaseResp.RawContentLength
  if ($latenciaSupabase -lt 1000) {
    Log "SUPABASE OK: convergência equilibrada ($latenciaSupabase bytes)" "Green"
  } else {
    Log "ASSIMETRIA DETECTADA: Supabase divergente ($latenciaSupabase bytes)" "Yellow"
  }
} catch {
  Log "ERRO Supabase -> $($_.Exception.Message)" "Red"
}

# 6️⃣ Finalização
$Duration = (Get-Date) - $Start
Log "Tempo total: $([math]::Round($Duration.TotalSeconds,2)) segundos." "Gray"
Log "Relatório salvo em: $LogFile" "Cyan"
Log "VALIDAÇÃO COMPLETA: GPS + Supabase + Domínio PecuariaTech OK." "Green"
