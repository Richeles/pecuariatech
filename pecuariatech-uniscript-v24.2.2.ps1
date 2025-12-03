# ============================================================
# PECUARIATECH UNISCRIPT v24.2.2 - SCRIPT ÚNICO FINAL
# Monitoramento + Diagnóstico + Deploy + GPS + WhatsApp + Supabase
# ============================================================

$ErrorActionPreference = "Stop"

# ====================================
# CONFIGURAÇÕES FIXAS
# ====================================
$ROOT    = "C:\Users\Administrador\pecuariatech"
$LOG     = Join-Path $ROOT "pecuariatech-uniscript.log"
$SiteUrl = "https://www.pecuariatech.com"

# SUPABASE - TUA INSTÂNCIA REAL
$SupabaseUrl = "https://kpzzekflqpoeccnqfkng.supabase.co/rest/v1/unilog"
$SupabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

# WHATSAPP (CallMeBot)
$WhatsNumber = ""
$WhatsToken  = ""

# TEMPO DO MONITORAMENTO
$IntervaloSegundos   = 120
$MinutosEntreDeploys = 15

$global:LastDeploy = (Get-Date).AddYears(-1)

# ====================================
# LOG
# ====================================
function Escrever-Log {
    param([string]$Mensagem,[string]$Tipo="INFO")
    $data  = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $linha = "[$data][$Tipo] $Mensagem"
    Add-Content -Path $LOG -Value $linha
    Write-Host $linha
}

# ====================================
# WHATSAPP
# ====================================
function Enviar-WhatsApp {
    param([string]$Texto)

    if (-not $WhatsNumber -or -not $WhatsToken) {
        return
    }

    try {
        $enc = [uri]::EscapeDataString($Texto)
        $url = "https://api.callmebot.com/whatsapp.php?phone=$WhatsNumber&text=$enc&apikey=$WhatsToken"
        Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10 | Out-Null
    } catch {
        Escrever-Log "Erro WhatsApp: $_" "ERROR"
    }
}

# ====================================
# AMBIENTE
# ====================================
function Testar-Ambiente {
    Escrever-Log "Checando ambiente..." "CHECK"
    $ok = $true

    try { node -v | Out-Null } catch { Escrever-Log "Node não encontrado." "ERROR"; $ok=$false }
    try { npm -v  | Out-Null } catch { Escrever-Log "npm não encontrado." "ERROR";  $ok=$false }
    try { vercel --version | Out-Null } catch { Escrever-Log "Vercel CLI não encontrado." "ERROR"; $ok=$false }

    return $ok
}

# ====================================
# PERMISSÕES
# ====================================
function Testar-Permissoes {
    Escrever-Log "Testando permissões..." "CHECK"
    $ok = $true

    try { "x" | Out-File "$ROOT\test.tmp"; Remove-Item "$ROOT\test.tmp" -Force } 
    catch { Escrever-Log "Sem permissão no ROOT." "ERROR"; $ok=$false }

    try { "x" | Out-File $LOG -Append } 
    catch { Escrever-Log "Sem permissão no LOG." "ERROR"; $ok=$false }

    return $ok
}

# ====================================
# TRIÂNGULO 360
# ====================================
function Testar-Rede {
    $host = ([System.Uri]$SiteUrl).Host
    $ok = $true

    try { Resolve-DnsName $host | Out-Null } catch { Escrever-Log "DNS falhou para ${host}" "ERROR"; $ok=$false }
    try { Test-Connection -ComputerName $host -Count 1 -Quiet | Out-Null } catch { Escrever-Log "Ping falhou (${host})" "WARN" }
    try { Invoke-WebRequest -Uri $SiteUrl -TimeoutSec 10 | Out-Null } catch { Escrever-Log "HTTP falhou (${SiteUrl})" "WARN"; $ok=$false }

    return $ok
}

# ====================================
# GPS
# ====================================
function Obter-GPS {
    try {
        $resp = Invoke-RestMethod "https://ipinfo.io/json" -TimeoutSec 10
        if ($resp.loc) {
            $lat,$lng = $resp.loc.Split(",")
            return @{ latitude=$lat; longitude=$lng; timestamp=(Get-Date).ToString("o") }
        }
    } catch {}
    return @{ latitude="0"; longitude="0"; timestamp=(Get-Date).ToString("o") }
}

# ====================================
# SUPABASE
# ====================================
function Enviar-Supabase {
    param($Gps,[string]$Status)

    try {
        $body = @{
            gps_lat   = $Gps.latitude
            gps_lng   = $Gps.longitude
            timestamp = $Gps.timestamp
            status    = $Status
        } | ConvertTo-Json

        Invoke-RestMethod -Method Post -Uri $SupabaseUrl -Headers @{
            apikey        = $SupabaseKey
            Authorization = "Bearer $SupabaseKey"
            "Content-Type" = "application/json"
        } -Body $body
    } catch {
        Escrever-Log "Erro Supabase: $_" "ERROR"
    }
}

# ====================================
# TESTE DO SITE
# ====================================
function Testar-Site {
    try {
        $res = Invoke-WebRequest -Uri $SiteUrl -TimeoutSec 10
        if ($res.StatusCode -eq 200) { return "ONLINE" }
        return "DEGRADADO"
    } catch {
        return "OFFLINE"
    }
}

# ====================================
# DEPLOY
# ====================================
function Fazer-Deploy {
    $agora = Get-Date
    if (($agora - $global:LastDeploy).TotalMinutes -lt $MinutosEntreDeploys) {
        Escrever-Log "Deploy bloqueado pelo anti-loop." "WARN"
        return
    }

    $global:LastDeploy = $agora

    if (-not (Testar-Ambiente)) { return }
    if (-not (Testar-Permissoes)) { return }

    Escrever-Log "Iniciando deploy..." "DEPLOY"

    try {
        Set-Location $ROOT
        if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

        npm install
        if ($LASTEXITCODE -ne 0) { Escrever-Log "npm install falhou." "ERROR"; return }

        npm run build
        if ($LASTEXITCODE -ne 0) { Escrever-Log "Build falhou." "ERROR"; return }

        vercel --prod --confirm
        if ($LASTEXITCODE -ne 0) { Escrever-Log "Deploy Vercel falhou." "ERROR"; return }

        Escrever-Log "Deploy concluído com sucesso." "DEPLOY"
    } catch {
        Escrever-Log "Erro no deploy: $_" "ERROR"
    }
}

# ====================================
# CICLO PRINCIPAL
# ====================================
function Ciclo-Monitor {
    Escrever-Log "Novo ciclo..." "MONITOR"

    Testar-Rede | Out-Null

    $gps    = Obter-GPS
    $status = Testar-Site

    Enviar-Supabase -Gps $gps -Status $status

    if ($status -eq "OFFLINE") {
        Escrever-Log "Site OFFLINE – iniciando recuperação." "WARN"
        Fazer-Deploy
    }
}

# ====================================
# LOOP 24/7
# ====================================
Escrever-Log "UniScript v24.2.2 iniciado." "INFO"

while ($true) {
    Ciclo-Monitor
    Start-Sleep -Seconds $IntervaloSegundos
}
