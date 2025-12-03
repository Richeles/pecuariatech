<#
 Deploy-GPS-Supabase-Full v4.1 – Triângulo 360°
 Autor: Richeles A. dos Santos
 Objetivo: validar Rede 🌐 | DNS 🌍 | REST ⚙️ antes de qualquer upload.
#>

# ============ CONFIGURAÇÃO ============
$SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$ApiKey      = $env:SUPABASE_SERVICE_ROLE_KEY
$LogDir      = "C:\Logs\PecuariaTech"
$LogFile     = Join-Path $LogDir "triangulo360_log.csv"

# Cria pasta de logs se não existir
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

# ============ FUNÇÕES ============
function Show-Alert {
    param([string]$Title,[string]$Msg,[switch]$Error)
    if ($Error) {
        Write-Host "❌ $Title — $Msg" -ForegroundColor Red
        [console]::beep(400,300)
    } else {
        Write-Host "✅ $Title — $Msg" -ForegroundColor Green
        [console]::beep(1000,120)
    }
}

function Test-Rede {
    try {
        Test-Connection pecuariatech.com -Count 1 -ErrorAction Stop | Out-Null
        Show-Alert "Rede" "Conexão com a internet OK"
        return $true
    } catch {
        Show-Alert "Rede" "Falha na conexão de rede" -Error
        return $false
    }
}

function Test-DNS {
    try {
        Resolve-DnsName pecuariatech.com -ErrorAction Stop | Out-Null
        Show-Alert "DNS" "Resolução DNS OK"
        return $true
    } catch {
        Show-Alert "DNS" "Falha na resolução de domínio" -Error
        return $false
    }
}

function Test-REST {
    if (-not $SupabaseUrl -or $SupabaseUrl -match "<teu-supabase-url>") {
        Show-Alert "REST" "URL Supabase inválida. Configure a variável NEXT_PUBLIC_SUPABASE_URL." -Error
        return $false
    }
    try {
        $endpoint = "$SupabaseUrl/rest/v1/pastagem"
        $headers = @{ apikey = $ApiKey }
        $res = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method Get -TimeoutSec 10
        Show-Alert "REST" "Comunicação Supabase OK"
        return $true
    } catch {
        Show-Alert "REST" "Erro ao acessar endpoint Supabase: $($_.Exception.Message)" -Error
        return $false
    }
}

# ============ EXECUÇÃO ============
Write-Host "`n🔺 Iniciando Triângulo 360° — PecuariaTech v4.1" -ForegroundColor Cyan

$RedeOK = Test-Rede
$DnsOK  = Test-DNS
$RestOK = Test-REST

$Data = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$StatusGeral = if ($RedeOK -and $DnsOK -and $RestOK) { "OK" } else { "FALHA" }

# ============ RESULTADOS ============
if ($StatusGeral -eq "OK") {
    Show-Alert "Triângulo 360°" "Todos os vértices validados com sucesso!"
} else {
    Write-Host "`n⚠️  Falha detectada em um ou mais vértices do Triângulo 360°:" -ForegroundColor Yellow
    if (-not $RedeOK) { Write-Host "   → Rede ❌" -ForegroundColor Yellow }
    if (-not $DnsOK)  { Write-Host "   → DNS ❌" -ForegroundColor Yellow }
    if (-not $RestOK) { Write-Host "   → REST ❌" -ForegroundColor Yellow }
    Write-Host "Revise variáveis e conexão antes de continuar." -ForegroundColor Yellow
}

# ============ LOG ============
$log = [PSCustomObject]@{
    Data  = $Data
    Rede  = $RedeOK
    DNS   = $DnsOK
    REST  = $RestOK
    Status= $StatusGeral
}
$log | Export-Csv -Path $LogFile -Append -NoTypeInformation
Write-Host "`n📜 Log salvo em: $LogFile`n" -ForegroundColor Gray
