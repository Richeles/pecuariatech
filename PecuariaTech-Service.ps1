# =====================================================================
# PecuariaTech • UniScript Service v24.3
# Modo Serviço do Windows - Monitoramento 24/7
# Triângulo360: DNS + PING + HTTP + Supabase + Deploy + WhatsApp + GPS
# Serviço: PecuariaTech-UniScript
# =====================================================================

# Recomendado: salvar este arquivo em C:\PecuariaTech\pecuariatech-service.ps1

param()

$ErrorActionPreference = "Stop"

# Garante TLS 1.2 (necessário pra muitas APIs HTTPS modernas)
try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
} catch { }

# ------------------------ CONFIGURAÇÕES GERAIS ------------------------

# NOME DO SERVIÇO (se mudar aqui, mude também no install-service.ps1)
$ServiceName = "PecuariaTech-UniScript"

# Intervalo entre ciclos (em segundos)
$IntervalSeconds = 60

# Diretórios de trabalho / logs
$RootDir  = "C:\PecuariaTech"
$LogDir   = Join-Path $RootDir "Logs"
$StateDir = Join-Path $RootDir "State"

# Cria diretórios se não existirem
New-Item -ItemType Directory -Force -Path $RootDir,$LogDir,$StateDir | Out-Null

# Arquivo de log diário
function Get-LogFile {
    $date = Get-Date -Format "yyyyMMdd"
    return (Join-Path $LogDir "uniscript-$date.log")
}

# ------------------------ SUPABASE ------------------------

# URL do seu projeto Supabase
$SupabaseUrl   = "https://kpzzekflqpoeccnqfkng.supabase.co"

# ATENÇÃO: COLE AQUI SUA SERVICE ROLE KEY REAL
# (NÃO compartilhe essa chave com ninguém fora do seu controle)
$SupabaseKey   = "COLOQUE_AQUI_SUA_SUPABASE_SERVICE_ROLE_KEY"

# Nome da tabela de logs
$SupabaseTable = "unilog"

# ------------------------ ALVO MONITORADO ------------------------

# Host e URL do seu site (Triângulo360)
$TargetHost = "pecuariatech.vercel.app"
$TargetUrl  = "https://pecuariatech.vercel.app"

# Hook de deploy da Vercel (substitua pelo seu)
$VercelDeployHookUrl = "https://SEU-HOOK-DE-DEPLOY-VERCEL-AQUI"

# Intervalo mínimo entre deploys (minutos) pra evitar loop
$MinDeployIntervalMinutes = 10

# ------------------------ WHATSAPP (OPCIONAL) ------------------------

# Habilitar/desabilitar WhatsApp
$WhatsAppEnabled = $false    # coloque $true quando configurar

# Exemplo com CallMeBot ou outro gateway
$WhatsAppApiUrl = "https://api.callmebot.com/whatsapp.php"
$WhatsAppPhone  = "55SEUNUMEROAQUI"      # ex: 5567999999999
$WhatsAppToken  = "SEU_TOKEN_AQUI"

# Intervalo mínimo entre alertas WhatsApp (minutos)
$MinWhatsAppIntervalMinutes = 15

# ------------------------ FUNÇÕES DE LOG ------------------------

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )

    try {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $line = "[$timestamp] [$ServiceName] [$Level] $Message"
        $logFile = Get-LogFile
        Add-Content -Path $logFile -Value $line
    } catch {
        # Último nível: não quebrar o serviço por causa de log
    }
}

# ------------------------ GPS via IP (ipinfo.io) ------------------------

function Get-GpsFromIp {
    try {
        $resp = Invoke-RestMethod -Uri "https://ipinfo.io/json" -Method Get
        if ($resp -and $resp.loc) {
            $parts = $resp.loc -split ","
            if ($parts.Count -eq 2) {
                return [pscustomobject]@{
                    Lat = $parts[0]
                    Lng = $parts[1]
                }
            }
        }
    } catch {
        Write-Log "Falha ao obter GPS via ipinfo.io: $($_.Exception.Message)" "WARN"
    }

    return [pscustomobject]@{
        Lat = $null
        Lng = $null
    }
}

# ------------------------ Triângulo360 (DNS + PING + HTTP) ------------------------

function Test-Triangulo360 {
    param(
        [string]$Host,
        [string]$Url
    )

    $dnsOk  = $false
    $pingOk = $false
    $httpOk = $false

    # DNS
    try {
        [System.Net.Dns]::GetHostEntry($Host) | Out-Null
        $dnsOk = $true
    } catch {
        $dnsOk = $false
    }

    # Ping
    try {
        $pingOk = Test-Connection -ComputerName $Host -Count 1 -Quiet -ErrorAction SilentlyContinue
    } catch {
        $pingOk = $false
    }

    # HTTP
    try {
        $resp = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
            $httpOk = $true
        }
    } catch {
        $httpOk = $false
    }

    $overall = if ($dnsOk -and $pingOk -and $httpOk) { "ONLINE" } else { "OFFLINE" }

    return [pscustomobject]@{
        DnsOk  = $dnsOk
        PingOk = $pingOk
        HttpOk = $httpOk
        Status = $overall
    }
}

# ------------------------ LOG NO SUPABASE ------------------------

function Send-SupabaseLog {
    param(
        [string]$Status,
        [string]$GpsLat,
        [string]$GpsLng
    )

    try {
        $body = @{
            gps_lat   = $GpsLat
            gps_lng   = $GpsLng
            status    = $Status
            timestamp = (Get-Date).ToString("o")
        }

        $jsonBody = $body | ConvertTo-Json -Depth 5

        $headers = @{
            apikey        = $SupabaseKey
            Authorization = "Bearer $SupabaseKey"
            Accept        = "application/json"
            "Content-Type" = "application/json"
            Prefer        = "return=minimal"
        }

        $url = "$SupabaseUrl/rest/v1/$SupabaseTable"

        Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $jsonBody | Out-Null

        Write-Log "Supabase OK (status $Status)."
    } catch {
        Write-Log "Erro ao enviar log para Supabase: $($_.Exception.Message)" "ERROR"
    }
}

# ------------------------ CONTROLE DE DEPLOY ------------------------

function Get-DeployStateFile {
    return (Join-Path $StateDir "deploy-state.json")
}

function Get-LastDeployInfo {
    $file = Get-DeployStateFile
    if (Test-Path $file) {
        try {
            $json = Get-Content -Path $file -Raw | ConvertFrom-Json
            return $json
        } catch { }
    }
    return $null
}

function Save-LastDeployInfo {
    param(
        [datetime]$When,
        [string]$Reason
    )

    $file = Get-DeployStateFile
    $obj = @{
        lastDeployAt = $When.ToString("o")
        reason       = $Reason
    }

    $obj | ConvertTo-Json -Depth 5 | Set-Content -Path $file -Encoding UTF8
}

function Invoke-DeployIfNeeded {
    param(
        [string]$Reason = "offline"
    )

    if (-not $VercelDeployHookUrl -or $VercelDeployHookUrl -eq "https://SEU-HOOK-DE-DEPLOY-VERCEL-AQUI") {
        Write-Log "Deploy NÃO acionado (hook Vercel não configurado)." "WARN"
        return
    }

    $info = Get-LastDeployInfo
    if ($info -and $info.lastDeployAt) {
        [datetime]$last = [datetime]::Parse($info.lastDeployAt)
        $diffMinutes = (New-TimeSpan -Start $last -End (Get-Date)).TotalMinutes
        if ($diffMinutes -lt $MinDeployIntervalMinutes) {
            Write-Log "Deploy ignorado (último deploy há $([math]::Round($diffMinutes,1)) min, limite = $MinDeployIntervalMinutes)." "WARN"
            return
        }
    }

    try {
        Write-Log "Acionando deploy Vercel (motivo: $Reason)..."
        Invoke-RestMethod -Uri $VercelDeployHookUrl -Method Post | Out-Null
        Save-LastDeployInfo -When (Get-Date) -Reason $Reason
        Write-Log "Deploy Vercel acionado com sucesso."
    } catch {
        Write-Log "Erro ao acionar deploy Vercel: $($_.Exception.Message)" "ERROR"
    }
}

# ------------------------ WHATSAPP ALERTA ------------------------

function Get-WhatsAppStateFile {
    return (Join-Path $StateDir "whatsapp-state.json")
}

function Get-LastWhatsAppInfo {
    $file = Get-WhatsAppStateFile
    if (Test-Path $file) {
        try {
            $json = Get-Content -Path $file -Raw | ConvertFrom-Json
            return $json
        } catch { }
    }
    return $null
}

function Save-LastWhatsAppInfo {
    param(
        [datetime]$When,
        [string]$Message
    )

    $file = Get-WhatsAppStateFile
    $obj = @{
        lastAlertAt = $When.ToString("o")
        message     = $Message
    }

    $obj | ConvertTo-Json -Depth 5 | Set-Content -Path $file -Encoding UTF8
}

function Send-WhatsAppNotification {
    param(
        [string]$Message
    )

    if (-not $WhatsAppEnabled) {
        return
    }

    if (-not $WhatsAppPhone -or -not $WhatsAppToken) {
        Write-Log "WhatsApp habilitado, mas número/token não configurados." "WARN"
        return
    }

    $info = Get-LastWhatsAppInfo
    if ($info -and $info.lastAlertAt) {
        [datetime]$last = [datetime]::Parse($info.lastAlertAt)
        $diffMinutes = (New-TimeSpan -Start $last -End (Get-Date)).TotalMinutes
        if ($diffMinutes -lt $MinWhatsAppIntervalMinutes) {
            Write-Log "Alerta WhatsApp ignorado (último há $([math]::Round($diffMinutes,1)) min, limite = $MinWhatsAppIntervalMinutes)." "WARN"
            return
        }
    }

    try {
        Write-Log "Enviando alerta WhatsApp..."

        # Exemplo genérico (ajuste conforme o gateway que você usar)
        $params = @{
            phone  = $WhatsAppPhone
            text   = $Message
            apikey = $WhatsAppToken
        }

        Invoke-RestMethod -Uri $WhatsAppApiUrl -Method Get -Body $params | Out-Null

        Save-LastWhatsAppInfo -When (Get-Date) -Message $Message
        Write-Log "Alerta WhatsApp enviado com sucesso."
    } catch {
        Write-Log "Erro ao enviar WhatsApp: $($_.Exception.Message)" "ERROR"
    }
}

# ------------------------ LOOP PRINCIPAL ------------------------

Write-Log "UniScript Service v24.3 iniciado. Serviço: $ServiceName"

while ($true) {
    try {
        Write-Log "Novo ciclo de monitoramento..."

        # 1) Triângulo360
        $tri = Test-Triangulo360 -Host $TargetHost -Url $TargetUrl
        Write-Log ("Triângulo360 -> DNS={0} PING={1} HTTP={2} STATUS={3}" -f $tri.DnsOk, $tri.PingOk, $tri.HttpOk, $tri.Status)

        # 2) GPS
        $gps = Get-GpsFromIp
        Write-Log ("GPS -> LAT={0} LNG={1}" -f $gps.Lat, $gps.Lng)

        # 3) Log no Supabase
        Send-SupabaseLog -Status $tri.Status -GpsLat $gps.Lat -GpsLng $gps.Lng

        # 4) Se estiver OFFLINE -> deploy + alerta
        if ($tri.Status -eq "OFFLINE") {
            Write-Log "STATUS OFFLINE detectado. Acionando contramedidas..."
            Invoke-DeployIfNeeded -Reason "triangulo360_offline"
            $msg = "PecuariaTech alerta: ambiente OFFLINE em {0:dd/MM/yyyy HH:mm}. DNS={1} PING={2} HTTP={3}" -f (Get-Date), $tri.DnsOk, $tri.PingOk, $tri.HttpOk
            Send-WhatsAppNotification -Message $msg
        } else {
            Write-Log "STATUS ONLINE. Tudo operando normalmente."
        }
    } catch {
        Write-Log "ERRO no ciclo principal: $($_.Exception.Message)" "ERROR"
    }

    Start-Sleep -Seconds $IntervalSeconds
}

