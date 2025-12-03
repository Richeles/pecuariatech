<#
🌾 PecuariaTech-Service v10.6 — ULTRA-PRO
Cloud-First • UTF-8 • Watchdog • Anti-Spam Telegram • HealthScore
Triângulo 360º (DNS / HTTPS / REST / Logs) + Auto-Throttle de ciclo

Tabela Supabase: triangulo360_logs
Campos: id, horario, node_id, item, status, detalhe, ms, versao
#>

# Força UTF-8 no console
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ============== CONFIG GERAL =======================
$VERSION                 = "v10.6-ULTRA-PRO"
$TABLE                   = "triangulo360_logs"

$BASE_INTERVAL_SECONDS   = 300   # intervalo base (5 min)
$Global:CurrentInterval  = $BASE_INTERVAL_SECONDS
$MAX_POST_RETRIES        = 3
$POST_RETRY_DELAY        = 2     # base (vai ser usado exponencialmente)
$WATCHDOG_THRESHOLD      = 3     # ciclos ruins seguidos
$HEALTH_WARN_THRESHOLD   = 80    # %
$HEALTH_BAD_THRESHOLD    = 60    # %

# Variáveis de ambiente Supabase
$SUPABASE_URL        = $env:PECUARIA_SUPABASE_URL
$SUPABASE_KEY_WRITE  = $env:PECUARIA_SUPABASE_KEY_WRITE
$SUPABASE_KEY_READ   = $env:PECUARIA_SUPABASE_KEY_READ

# Compatibilidade antiga
if (-not $SUPABASE_KEY_WRITE -and $env:PECUARIA_SUPABASE_KEY) {
    $SUPABASE_KEY_WRITE = $env:PECUARIA_SUPABASE_KEY
}
if (-not $SUPABASE_KEY_READ -and $env:PECUARIA_SUPABASE_KEY) {
    $SUPABASE_KEY_READ = $env:PECUARIA_SUPABASE_KEY
}

# Telegram
$TELEGRAM_BOT_TOKEN = $env:PECUARIA_TELEGRAM_BOT_TOKEN
$TELEGRAM_CHAT_ID   = $env:PECUARIA_TELEGRAM_CHAT_ID

# Node
$NODE_ID = $env:COMPUTERNAME
if (-not $NODE_ID -or $NODE_ID.Trim() -eq "") { $NODE_ID = "unknown-node" }

# Log em RAM
$Global:InMemoryLog         = New-Object System.Collections.Generic.List[Hashtable]
$Global:BadCycleCount       = 0
$Global:LastWatchdogAlertAt = $null

# ============== FUNÇÕES DE APOIO =======================
function Show-Banner {
@"
==============================================
🌾 PecuariaTech-Service $VERSION
Node: $NODE_ID
Supabase: $SUPABASE_URL
Tabela: $TABLE
==============================================
"@ | Write-Host
}

function Log {
    param(
        [string]$msg,
        [string]$level = "INFO"
    )
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    switch ($level) {
        "ERROR" { Write-Host "$ts [$level] $msg" -ForegroundColor Red }
        "WARN"  { Write-Host "$ts [$level] $msg" -ForegroundColor Yellow }
        "OK"    { Write-Host "$ts [$level] $msg" -ForegroundColor DarkGreen }
        default { Write-Host "$ts [$level] $msg" -ForegroundColor Cyan }
    }
}

function Add-InMemoryLog {
    param([Hashtable]$record)
    if ($Global:InMemoryLog.Count -ge 200) {
        $Global:InMemoryLog.RemoveAt(0)
    }
    $Global:InMemoryLog.Add($record) | Out-Null
}

# ============== GARANTIR VARIÁVEIS ===================
if (-not $SUPABASE_URL) {
    $u = Read-Host "Informe a URL do Supabase (https://xxxx.supabase.co)"
    if (-not $u) { Log "URL não informada. Saindo." "ERROR"; exit 1 }
    setx PECUARIA_SUPABASE_URL $u | Out-Null
    $SUPABASE_URL = $u
}
if (-not $SUPABASE_KEY_WRITE) {
    $k = Read-Host "Service Role KEY do Supabase (backend)"
    if (-not $k) { Log "Chave não informada. Saindo." "ERROR"; exit 1 }
    setx PECUARIA_SUPABASE_KEY_WRITE $k | Out-Null
    $SUPABASE_KEY_WRITE = $k
}
if (-not $SUPABASE_KEY_READ) {
    $SUPABASE_KEY_READ = $SUPABASE_KEY_WRITE
}

Show-Banner
Log "Intervalo base: $BASE_INTERVAL_SECONDS s" "INFO"

# ============== ENVIAR PARA SUPABASE ==================
function Send-To-Supabase {
    param([Hashtable]$record)

    $detail = $record.detail
    if ($detail -and $detail.Length -gt 220) {
        $detail = $detail.Substring(0,220) + "..."
    }

    $payloadObj = @(
        @{
            horario = (Get-Date).ToString("s")
            node_id = $NODE_ID
            item    = $record.item
            status  = $record.status
            detalhe = $detail
            ms      = [int]$record.ms
            versao  = $VERSION
        }
    )

    $json = $payloadObj | ConvertTo-Json -Compress -Depth 10

    $url = "$SUPABASE_URL/rest/v1/$TABLE"
    $headers = @{
        apikey         = $SUPABASE_KEY_WRITE
        Authorization  = "Bearer $SUPABASE_KEY_WRITE"
        "Content-Type" = "application/json"
        Prefer         = "return=minimal"
    }

    $attempt = 0
    while ($attempt -lt $MAX_POST_RETRIES) {
        $attempt++
        $delay = $POST_RETRY_DELAY * [math]::Pow(2, ($attempt - 1))  # retry exponencial
        try {
            Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body $json -TimeoutSec 15 -ErrorAction Stop | Out-Null
            Log "Supabase OK: $($record.item) ($($record.ms) ms)" "OK"
            Add-InMemoryLog $record
            return
        } catch {
            Log "Falha POST (tentativa $attempt/$MAX_POST_RETRIES): $($_.Exception.Message)" "WARN"
            Start-Sleep -Seconds $delay
        }
    }

    Log "ERRO FINAL: Não foi possível enviar registro ao Supabase." "ERROR"
}

# ============== ALERTAS TELEGRAM ======================
function Send-CycleAlert {
    param(
        [System.Collections.Generic.List[Hashtable]]$failedRecords,
        [double]$healthScore
    )

    if (-not $failedRecords -or $failedRecords.Count -eq 0) { return }

    if (-not $TELEGRAM_BOT_TOKEN -or -not $TELEGRAM_CHAT_ID) {
        Log "Falhas no ciclo, mas Telegram não configurado." "WARN"
        return
    }

    # Anti-spam: limita tamanho e resumo
    $failsText = ""
    foreach ($rec in $failedRecords) {
        $line = "- $($rec.item): $($rec.detail)`n"
        if (($failsText + $line).Length -gt 800) {
            $failsText += "- ... mais falhas no ciclo ..." 
            break
        }
        $failsText += $line
    }

    $msg = @"
⚠️ ALERTA PECUARIATECH — CICLO CRÍTICO

Node: $NODE_ID
HealthScore: $([math]::Round($healthScore,2)) %
Falhas:
$failsText

Versão: $VERSION
Horário: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

    $msgTrim = $msg
    if ($msgTrim.Length -gt 3500) {
        $msgTrim = $msgTrim.Substring(0,3500) + "`n[resumido...]"
    }

    $api = "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage"

    try {
        Invoke-RestMethod -Method Post -Uri $api `
            -Body (@{chat_id=$TELEGRAM_CHAT_ID;text=$msgTrim}|ConvertTo-Json) `
            -ContentType "application/json" -TimeoutSec 10 | Out-Null
        Log "Resumo de falhas enviado via Telegram." "WARN"
    } catch {
        Log "Erro enviando alerta Telegram: $($_.Exception.Message)" "ERROR"
    }
}

function Send-WatchdogAlert {
    param([double]$healthScore)

    if (-not $TELEGRAM_BOT_TOKEN -or -not $TELEGRAM_CHAT_ID) {
        Log "Watchdog: condição crítica, mas Telegram não configurado." "ERROR"
        return
    }

    $msg = @"
🛑 WATCHDOG — Triângulo 360º em estado crítico

Node: $NODE_ID
HealthScore médio (últimos ciclos): $([math]::Round($healthScore,2)) %
Ciclos ruins consecutivos: $Global:BadCycleCount

Versão: $VERSION
Horário: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Verifique:
- DNS do domínio pecuariatech
- HTTPS / certificado
- Supabase (status, RLS, chaves)
"@

    $api = "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage"

    try {
        Invoke-RestMethod -Method Post -Uri $api `
            -Body (@{chat_id=$TELEGRAM_CHAT_ID;text=$msg}|ConvertTo-Json) `
            -ContentType "application/json" -TimeoutSec 10 | Out-Null
        Log "Alerta WATCHDOG enviado via Telegram." "ERROR"
    } catch {
        Log "Erro ao enviar alerta WATCHDOG: $($_.Exception.Message)" "ERROR"
    }
}

# ============== TESTES TRIÂNGULO 360º =================
function Test-DNS {
    $host = "www.pecuariatech.com"
    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        Resolve-DnsName $host -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{item="DNS";status="OK";detail="resolvido";ms=[math]::Round($sw.Elapsed.TotalMilliseconds)}
    } catch {
        try {
            $sw.Restart()
            $proc = Start-Process "nslookup" $host -NoNewWindow -RedirectStandardOutput -PassThru -WindowStyle Hidden
            $proc.WaitForExit(5000) | Out-Null
            $sw.Stop()
            if ($proc.ExitCode -eq 0) {
                return @{item="DNS";status="OK";detail="nslookup OK";ms=[math]::Round($sw.Elapsed.TotalMilliseconds)}
            }
            return @{item="DNS";status="FAIL";detail="nslookup falhou";ms=0}
        } catch {
            return @{item="DNS";status="FAIL";detail="erro DNS";ms=0}
        }
    }
}

function Test-HTTPS {
    $url = "https://www.pecuariatech.com"
    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{item="HTTPS";status="OK";detail="200/OK";ms=[math]::Round($sw.Elapsed.TotalMilliseconds)}
    } catch {
        $sw.Stop()
        $msg = $_.Exception.Message
        if ($msg.Length -gt 200) { $msg = $msg.Substring(0,200)+"..." }
        return @{item="HTTPS";status="FAIL";detail=$msg;ms=[math]::Round($sw.Elapsed.TotalMilliseconds)}
    }
}

function Test-REST {
    param([string]$table)

    $url = "$SUPABASE_URL/rest/v1/$table?select=*&limit=1"
    $key = $SUPABASE_KEY_READ
    $sw  = [Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-RestMethod -Uri $url -Headers @{apikey=$key;Authorization="Bearer $key"} `
            -TimeoutSec 10 -ErrorAction Stop | Out-Null
        $sw.Stop()
        return @{item="REST-$table";status="OK";detail="consulta OK";ms=[math]::Round($sw.Elapsed.TotalMilliseconds)}
    } catch {
        $sw.Stop()
        $msg = $_.Exception.Message
        if ($msg.Length -gt 220) { $msg = $msg.Substring(0,220)+"..." }
        return @{item="REST-$table";status="FAIL";detail=$msg;ms=[math]::Round($sw.Elapsed.TotalMilliseconds)}
    }
}

# ============== LOOP PRINCIPAL ========================
$tables = @("pastagem","rebanho","financeiro","racas","dashboard","triangulo360_logs")

Log "Loop Triângulo 360º iniciado..." "INFO"

while ($true) {
    try {
        Log ""
        Log "========== NOVO CICLO ==========" "INFO"

        $cycleResults = New-Object System.Collections.Generic.List[Hashtable]
        $failsThisCycle = New-Object System.Collections.Generic.List[Hashtable]
        $latencies = @()

        # DNS
        $dns = Test-DNS
        $lvl = if ($dns.status -eq "OK") { "OK" } else { "ERROR" }
        Log "DNS: $($dns.status) ($($dns.ms) ms) - $($dns.detail)" $lvl
        $cycleResults.Add($dns)
        $latencies += $dns.ms
        if ($dns.status -ne "OK") { $failsThisCycle.Add($dns) }
        Send-To-Supabase $dns

        # HTTPS
        $https = Test-HTTPS
        $lvl = if ($https.status -eq "OK") { "OK" } else { "ERROR" }
        Log "HTTPS: $($https.status) ($($https.ms) ms) - $($https.detail)" $lvl
        $cycleResults.Add($https)
        $latencies += $https.ms
        if ($https.status -ne "OK") { $failsThisCycle.Add($https) }
        Send-To-Supabase $https

        # REST Tabelas
        foreach ($t in $tables) {
            $r = Test-REST -table $t
            $lvl = if ($r.status -eq "OK") { "OK" } else { "ERROR" }
            Log "REST-$t: $($r.status) ($($r.ms) ms) - $($r.detail)" $lvl
            $cycleResults.Add($r)
            $latencies += $r.ms
            if ($r.status -ne "OK") { $failsThisCycle.Add($r) }
            Send-To-Supabase $r
        }

        # HEALTHSCORE
        $totalChecks = $cycleResults.Count
        $okChecks    = ($cycleResults | Where-Object { $_.status -eq "OK" }).Count
        $failChecks  = $totalChecks - $okChecks
        $healthScore = if ($totalChecks -gt 0) { [math]::Round(100 * $okChecks / $totalChecks,2) } else { 0 }

        $avgMs = if ($latencies.Count -gt 0) { [math]::Round(($latencies | Measure-Object -Average).Average,2) } else { 0 }

        $healthLevel = "OK"
        if ($healthScore -lt $HEALTH_BAD_THRESHOLD) {
            $healthLevel = "ERROR"
        } elseif ($healthScore -lt $HEALTH_WARN_THRESHOLD) {
            $healthLevel = "WARN"
        }

        Log "HealthScore: $healthScore %  | OK=$okChecks / FAIL=$failChecks | Latência média=$avgMs ms" $healthLevel

        # registra HealthScore no Supabase
        $hsRecord = @{
            item   = "HEALTHSCORE"
            status = if ($healthScore -ge $HEALTH_WARN_THRESHOLD) { "OK" } elseif ($healthScore -ge $HEALTH_BAD_THRESHOLD) { "WARN" } else { "FAIL" }
            detail = "hs=${healthScore}%, ok=$okChecks, fail=$failChecks, avgMs=$avgMs"
            ms     = [int]$avgMs
        }
        Send-To-Supabase $hsRecord

        # WATCHDOG (3 ciclos ruins seguidos ou DNS/HTTPS falhando)
        $isBadCycle = ($healthScore -lt $HEALTH_BAD_THRESHOLD) -or ($dns.status -ne "OK") -or ($https.status -ne "OK")
        if ($isBadCycle) {
            $Global:BadCycleCount++
            Log "Watchdog: ciclo considerado RUIM (consecutivos = $Global:BadCycleCount)" "WARN"
        } else {
            $Global:BadCycleCount = 0
        }

        # Anti-spam: alerta consolidado por ciclo
        if ($failsThisCycle.Count -gt 0) {
            Send-CycleAlert -failedRecords $failsThisCycle -healthScore $healthScore
        }

        # Watchdog alerta especial
        if ($Global:BadCycleCount -ge $WATCHDOG_THRESHOLD) {
            # evita mandar o mesmo alerta direto
            $now = Get-Date
            $shouldSend = $true
            if ($Global:LastWatchdogAlertAt -ne $null) {
                if (($now - $Global:LastWatchdogAlertAt).TotalMinutes -lt 30) {
                    $shouldSend = $false
                    Log "Watchdog: já alertou há menos de 30 minutos, não repetindo." "WARN"
                }
            }
            if ($shouldSend) {
                Send-WatchdogAlert -healthScore $healthScore
                $Global:LastWatchdogAlertAt = $now
            }
        }

        # AUTO-THROTTLE: ajusta intervalo com base na latência média
        $oldInterval = $Global:CurrentInterval
        if ($avgMs -gt 2500 -and $Global:CurrentInterval -lt 900) {
            $Global:CurrentInterval += 60
            Log "Auto-Throttle: latência alta ($avgMs ms). Intervalo aumentado para $($Global:CurrentInterval) s." "WARN"
        } elseif ($avgMs -lt 800 -and $Global:CurrentInterval -gt $BASE_INTERVAL_SECONDS) {
            $Global:CurrentInterval -= 60
            if ($Global:CurrentInterval -lt $BASE_INTERVAL_SECONDS) {
                $Global:CurrentInterval = $BASE_INTERVAL_SECONDS
            }
            Log "Auto-Throttle: ambiente estável ($avgMs ms). Intervalo reduzido para $($Global:CurrentInterval) s." "OK"
        } else {
            Log "Intervalo mantido em $($Global:CurrentInterval) s." "INFO"
        }

        Log "Ciclo concluído. Dormindo $($Global:CurrentInterval) s..." "INFO"
    }
    catch {
        Log "[FATAL] Erro inesperado no ciclo: $($_.Exception.Message)" "ERROR"
    }

    Start-Sleep -Seconds $Global:CurrentInterval
}
