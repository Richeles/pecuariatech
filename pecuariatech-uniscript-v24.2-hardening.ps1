# ============================================================
# PECUARIATECH UNISCRIPT v24.2 - ULTRA HARDENING (SCRIPT ÚNICO)
# Monitoramento + Diagnostico + Autodeploy + Supabase + WhatsApp + Logs
# ============================================================

$ErrorActionPreference = "Stop"

# Configurações fixas
$ROOT          = "C:\Users\Administrador\pecuariatech"
$LOG           = Join-Path $ROOT "pecuariatech-uniscript.log"
$SiteUrl       = "https://www.pecuariatech.com"

# Supabase (já com o teu projeto e Service Role)
$SupabaseUrl   = "https://kpzzekflqpoeccnqfkng.supabase.co/rest/v1/unilog"
$SupabaseKey   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"

# WhatsApp (preencha se quiser alerta)
$WhatsNumber   = ""   # exemplo: 5567999999999
$WhatsToken    = ""   # apikey do CallMeBot

# Parâmetros de monitor
$IntervaloSegundos   = 120   # tempo entre ciclos
$MinutosEntreDeploys = 15    # mínimo entre deploys automáticos

$global:LastDeploy = (Get-Date).AddYears(-1)

# ------------------------------------------------------------
# Função de log
# ------------------------------------------------------------
function Escrever-Log {
    param(
        [string]$Mensagem,
        [string]$Tipo = "INFO"
    )
    $data  = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $linha = "[$data][$Tipo] $Mensagem"
    Add-Content -Path $LOG -Value $linha
    Write-Host $linha
}

# ------------------------------------------------------------
# WhatsApp
# ------------------------------------------------------------
function Enviar-WhatsApp {
    param([string]$Texto)

    if (-not $WhatsNumber -or -not $WhatsToken) {
        Escrever-Log "WhatsApp não configurado. Pulando envio." "WHATSAPP"
        return
    }

    try {
        $encoded = [uri]::EscapeDataString($Texto)
        $url = "https://api.callmebot.com/whatsapp.php?phone=$WhatsNumber&text=$encoded&apikey=$WhatsToken"
        Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 15 | Out-Null
        Escrever-Log "Mensagem WhatsApp enviada: $Texto" "WHATSAPP"
    }
    catch {
        Escrever-Log "Falha ao enviar WhatsApp: $_" "ERROR"
    }
}

# ------------------------------------------------------------
# Diagnóstico de ambiente (Node, npm, Vercel)
# ------------------------------------------------------------
function Testar-Ambiente {
    Escrever-Log "Iniciando diagnóstico de ambiente..." "CHECK"
    $ok = $true

    try {
        $nodeVer = node -v 2>$null
        if ($nodeVer) {
            Escrever-Log "Node encontrado: $nodeVer" "CHECK"
        } else {
            Escrever-Log "Node não encontrado no PATH." "ERROR"
            $ok = $false
        }
    } catch {
        Escrever-Log "Erro ao checar Node: $_" "ERROR"
        $ok = $false
    }

    try {
        $npmVer = npm -v 2>$null
        if ($npmVer) {
            Escrever-Log "npm encontrado: $npmVer" "CHECK"
        } else {
            Escrever-Log "npm não encontrado no PATH." "ERROR"
            $ok = $false
        }
    } catch {
        Escrever-Log "Erro ao checar npm: $_" "ERROR"
        $ok = $false
    }

    try {
        $vercelVer = vercel --version 2>$null
        if ($vercelVer) {
            Escrever-Log "Vercel CLI encontrado: $vercelVer" "CHECK"
        } else {
            Escrever-Log "Vercel CLI não encontrado no PATH." "ERROR"
            $ok = $false
        }
    } catch {
        Escrever-Log "Erro ao checar Vercel CLI: $_" "ERROR"
        $ok = $false
    }

    return $ok
}

# ------------------------------------------------------------
# Teste de permissões de escrita
# ------------------------------------------------------------
function Testar-Permissoes {
    Escrever-Log "Testando permissões de escrita em ROOT e LOG..." "CHECK"
    $ok = $true

    try {
        $arquivoTeste = Join-Path $ROOT "teste_permissao.tmp"
        "teste" | Out-File -FilePath $arquivoTeste -Encoding UTF8
        Remove-Item $arquivoTeste -Force -ErrorAction SilentlyContinue
        Escrever-Log "Permissão de escrita OK na pasta ROOT." "CHECK"
    }
    catch {
        Escrever-Log "Sem permissão de escrita em ROOT: $_" "ERROR"
        $ok = $false
    }

    try {
        "teste log" | Out-File -FilePath $LOG -Append -Encoding UTF8
        Escrever-Log "Permissão de escrita OK no arquivo de log." "CHECK"
    }
    catch {
        Escrever-Log "Sem permissão de escrita no arquivo de log: $_" "ERROR"
        $ok = $false
    }

    return $ok
}

# ------------------------------------------------------------
# Teste de rede / DNS + HTTP (Triângulo 360 lado rede/site)
# ------------------------------------------------------------
function Testar-Rede {
    Escrever-Log "Iniciando teste de rede (DNS + HTTP)..." "CHECK"
    $ok = $true

    try {
        $uri = [System.Uri]$SiteUrl
        $host = $uri.Host
    }
    catch {
        Escrever-Log "SiteUrl inválida: $SiteUrl" "ERROR"
        return $false
    }

    try {
        Resolve-DnsName -Name $host -ErrorAction Stop | Out-Null
        Escrever-Log "DNS resolvido para ${host}." "CHECK"
    }
    catch {
        Escrever-Log "Falha ao resolver DNS para ${host}: $_" "ERROR"
        $ok = $false
    }

    try {
        $pingOk = Test-Connection -ComputerName $host -Count 1 -Quiet -ErrorAction SilentlyContinue
        if ($pingOk) {
            Escrever-Log "Ping para ${host} OK." "CHECK"
        } else {
            Escrever-Log "Ping para ${host} falhou (pode ser bloqueado, não necessariamente erro)." "WARN"
        }
    }
    catch {
        Escrever-Log "Erro ao executar ping para ${host}: $_" "WARN"
    }

    try {
        $res = Invoke-WebRequest -Uri $SiteUrl -TimeoutSec 10 -ErrorAction Stop
        Escrever-Log "HTTP em ${SiteUrl} respondeu com código $($res.StatusCode)." "CHECK"
    }
    catch {
        Escrever-Log "Falha em HTTP para ${SiteUrl}: $_" "WARN"
        $ok = $false
    }

    return $ok
}

# ------------------------------------------------------------
# Localização aproximada via IP
# ------------------------------------------------------------
function Obter-GPS {
    try {
        $resp = Invoke-RestMethod -Uri "https://ipinfo.io/json" -TimeoutSec 10
        if ($resp -and $resp.loc) {
            $lat, $lng = $resp.loc.Split(",")
            return @{
                latitude  = $lat
                longitude = $lng
                timestamp = (Get-Date).ToString("o")
            }
        } else {
            Escrever-Log "Resposta ipinfo.io sem campo loc. Usando 0,0." "WARN"
        }
    }
    catch {
        Escrever-Log "Falha ao obter GPS via ipinfo.io: $_" "WARN"
    }

    return @{
        latitude  = "0"
        longitude = "0"
        timestamp = (Get-Date).ToString("o")
    }
}

# ------------------------------------------------------------
# Envio de status para Supabase (lado REST do Triângulo 360)
# ------------------------------------------------------------
function Enviar-Supabase {
    param(
        [hashtable]$Gps,
        [string]$Status
    )

    if (-not $SupabaseUrl -or -not $SupabaseKey) {
        Escrever-Log "Supabase não configurado. Pulando envio." "SUPABASE"
        return
    }

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

        Escrever-Log "Registro enviado ao Supabase com status $Status." "SUPABASE"
    }
    catch {
        Escrever-Log "Erro ao enviar dados ao Supabase: $_" "ERROR"
    }
}

# ------------------------------------------------------------
# Teste simples do site (ONLINE / OFFLINE / DEGRADADO)
# ------------------------------------------------------------
function Testar-Site {
    try {
        $res = Invoke-WebRequest -Uri $SiteUrl -TimeoutSec 10 -ErrorAction Stop
        if ($res.StatusCode -eq 200) {
            Escrever-Log "Site ONLINE (200)." "HEALTH"
            return "ONLINE"
        } else {
            Escrever-Log "Site respondeu com código $($res.StatusCode)." "HEALTH"
            return "DEGRADADO"
        }
    }
    catch {
        Escrever-Log "Falha ao acessar o site. Considerando OFFLINE: $_" "WARN"
        return "OFFLINE"
    }
}

# ------------------------------------------------------------
# Deploy com proteção anti-loop
# ------------------------------------------------------------
function Fazer-Deploy {
    Escrever-Log "Solicitação de deploy recebida." "DEPLOY"

    $agora = Get-Date
    $dif = ($agora - $global:LastDeploy).TotalMinutes

    if ($dif -lt $MinutosEntreDeploys) {
        Escrever-Log "Deploy ignorado. Último deploy há $([int]$dif) minuto(s). Intervalo mínimo: $MinutosEntreDeploys." "WARN"
        return
    }

    $global:LastDeploy = $agora

    if (-not (Testar-Ambiente)) {
        Escrever-Log "Ambiente com problemas. Abortando deploy." "DEPLOY"
        Enviar-WhatsApp "Deploy abortado: problemas no ambiente (Node/npm/Vercel)."
        return
    }

    if (-not (Testar-Permissoes)) {
        Escrever-Log "Permissões insuficientes. Abortando deploy." "DEPLOY"
        Enviar-WhatsApp "Deploy abortado: permissões insuficientes."
        return
    }

    if (-not (Testar-Rede)) {
        Escrever-Log "Teste de rede falhou. Prosseguindo com cuidado, mas verifique conectividade." "WARN"
    }

    Escrever-Log "Iniciando etapa de build/deploy..." "DEPLOY"
    Enviar-WhatsApp "Iniciando deploy automático do PecuariaTech."

    try {
        Set-Location $ROOT

        if (Test-Path ".next") {
            Escrever-Log "Removendo pasta .next antiga..." "DEPLOY"
            Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
        }

        Escrever-Log "Executando npm install..." "DEPLOY"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Escrever-Log "npm install retornou código $LASTEXITCODE." "ERROR"
            Enviar-WhatsApp "Erro em npm install no deploy do PecuariaTech."
            return
        }

        Escrever-Log "Executando npm run build..." "DEPLOY"
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Escrever-Log "npm run build retornou código $LASTEXITCODE." "ERROR"
            Enviar-WhatsApp "Build do PecuariaTech falhou. Verificar logs."
            return
        }

        Escrever-Log "Executando vercel --prod --confirm..." "DEPLOY"
        vercel --prod --confirm
        if ($LASTEXITCODE -ne 0) {
            Escrever-Log "vercel retornou código $LASTEXITCODE." "ERROR"
            Enviar-WhatsApp "Deploy na Vercel retornou erro. Código $LASTEXITCODE."
            return
        }

        Escrever-Log "Deploy concluído com sucesso." "DEPLOY"
        Enviar-WhatsApp "Deploy do PecuariaTech concluído com sucesso."
    }
    catch {
        Escrever-Log "Exceção durante o deploy: $_" "ERROR"
        Enviar-WhatsApp "Erro inesperado durante o deploy do PecuariaTech."
    }
}

# ------------------------------------------------------------
# Ciclo único de monitoramento + ação
# ------------------------------------------------------------
function Ciclo-Monitor {
    Escrever-Log "Iniciando ciclo de monitoramento..." "MONITOR"

    $gps    = Obter-GPS
    $status = Testar-Site

    Enviar-Supabase -Gps $gps -Status $status

    if ($status -eq "OFFLINE") {
        Escrever-Log "Site OFFLINE. Avaliando tentativa de correção (deploy)." "MONITOR"
        Enviar-WhatsApp "Alerta: PecuariaTech offline. Avaliando deploy corretivo."
        Fazer-Deploy
    } elseif ($status -eq "DEGRADADO") {
        Escrever-Log "Site respondeu, mas não com 200. Status DEGRADADO." "MONITOR"
    } else {
        Escrever-Log "Site ONLINE. Nenhuma ação corretiva necessária neste ciclo." "MONITOR"
    }
}

# ------------------------------------------------------------
# Loop principal 24/7
# ------------------------------------------------------------
Escrever-Log "UniScript PecuariaTech v24.2 - Ultra Hardening (script único) iniciado." "INFO"
Escrever-Log "Root: $ROOT | Log: $LOG" "INFO"

while ($true) {
    Ciclo-Monitor
    Start-Sleep -Seconds $IntervaloSegundos
}
