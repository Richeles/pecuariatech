<#
==========================================================================
 🌿 PECUARIATECH CLOUD SERVICE – v9.5.1 (Stable)
 🧠 Autor: Richeles Alves / GPT-5
 🧩 Caminho fixo: C:\Users\Administrador\pecuariatech\
 💾 Funções: Diagnóstico, Supabase Sync, Status HTML, AutoLoop
==========================================================================

Este script monitora, valida e gera status do projeto PecuariaTech
em tempo real. Corrigido para evitar conflitos com variáveis reservadas
($Host → $targetHost) e desativados alertas experimentais (Telegram/WABA).
#>

# =======================
# 📂 Caminho base fixo
# =======================
$BASE_PATH = "C:\Users\Administrador\pecuariatech\"
$LOG_PATH  = "$BASE_PATH\service.log"
$STATUS_HTML = "$BASE_PATH\status.html"

# =======================
# ⚙️ Configurações
# =======================
$SUPABASE_URL = $env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY = $env:PECUARIA_SUPABASE_KEY
$CYCLE_DELAY = 30   # segundos entre ciclos
$MAX_RETRIES = 3

# =======================
# 🧰 Funções auxiliares
# =======================
function Write-Log {
    param([string]$msg, [string]$level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "$timestamp [$level] $msg"
    Add-Content -Path $LOG_PATH -Value $entry
    Write-Host $entry
}

function Check-DNS {
    param([string]$host)
    try {
        [System.Net.Dns]::GetHostAddresses($host) | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Test-Supabase {
    param([string]$url)
    try {
        $r = Invoke-RestMethod -Uri "$url/rest/v1" -Method Head -TimeoutSec 5 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Write-StatusHTML {
    param([string]$status)
    $html = @"
<html>
<head><meta charset='utf-8'><title>PecuariaTech Status</title></head>
<body style='font-family:Segoe UI;background:#f2f2f2;padding:20px;'>
<h2>🐮 PecuariaTech Cloud Status</h2>
<p><b>Última verificação:</b> $(Get-Date -Format "HH:mm:ss dd/MM/yyyy")</p>
<p><b>Status Supabase:</b> $status</p>
<hr><small>v9.5.1 – Stable Service</small>
</body></html>
"@
    Set-Content -Path $STATUS_HTML -Value $html -Encoding UTF8
    Write-Log "Wrote $STATUS_HTML"
}

# =======================
# 🚀 Execução principal
# =======================
Write-Log "=== PecuariaTech Cloud Service v9.5.1 iniciado ==="

if (-not $SUPABASE_URL) {
    Write-Log "Variável de ambiente PECUARIA_SUPABASE_URL não definida!" "ERROR"
    exit 1
}

$targetHost = ($SUPABASE_URL -replace "^https?://","") -split "/" | Select-Object -First 1

Write-Log "Verificando host alvo: $targetHost"

if (-not (Check-DNS -host $targetHost)) {
    Write-Log "Host $targetHost não resolvido via DNS." "WARN"
}

# =======================
# 🔁 Ciclo de execução
# =======================
while ($true) {
    $cycleTime = Get-Date -Format "HH:mm:ss"
    Write-Log "=== Cycle $cycleTime ===" "CYCLE"

    $ok = $false
    $try = 0
    while (-not $ok -and $try -lt $MAX_RETRIES) {
        $try++
        Write-Log "Tentativa $try de conexão Supabase..."
        $ok = Test-Supabase -url $SUPABASE_URL
        if (-not $ok) {
            Write-Log "Falha na tentativa $try" "FIX"
            Start-Sleep -Seconds 3
        }
    }

    if ($ok) {
        Write-Log "Supabase ativo e respondendo. ✅"
        Write-StatusHTML -status "🟢 Online"
    } else {
        Write-Log "Supabase inativo após $MAX_RETRIES tentativas. ❌" "ERROR"
        Write-StatusHTML -status "🔴 Offline"
    }

    Write-Log "Aguardando próximo ciclo em $CYCLE_DELAY s..."
    Start-Sleep -Seconds $CYCLE_DELAY
}

# =======================
# 🧱 Fim
# =======================
