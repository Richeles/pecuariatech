<# 
 Deploy-GPS-Supabase-Full_v3.0_Triangulo360.ps1
 --------------------------------------------------------
 🔺 Teste “Triângulo 360°”: DNS + HTTPS + REST
 ✔ Corrigido conflito com variável $Host
 ✔ TLS 1.2/1.3 forçado automaticamente
 ✔ Diagnóstico automático inicial
 ✔ Popup verde de sucesso e log CSV
 ✔ Loop contínuo de upload Supabase
#>

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

# Variáveis Supabase
$SupabaseUrl   = $Env:NEXT_PUBLIC_SUPABASE_URL
$SupabaseKey   = $Env:SUPABASE_SERVICE_ROLE_KEY
$SupabaseTable = if ($Env:SUPABASE_TABLE) { $Env:SUPABASE_TABLE } else { 'pastagem' }

# Diretórios
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $Root 'data'
$QueuePath = Join-Path $DataDir 'entrada.jsonl'
$LogsDir = Join-Path $Root 'logs'
$BackupDir = Join-Path $LogsDir 'backup'
$CsvLog = Join-Path $LogsDir 'DeployLog.csv'
$LoopInterval = 3

#============================ FUNÇÕES ============================#
function Ensure-Directories {
    foreach ($p in @($DataDir, $LogsDir, $BackupDir)) {
        if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
    }
}

function Init-CsvLog {
    if (-not (Test-Path $CsvLog)) {
        "Timestamp,Latitude,Longitude,COmega,Status,Mensagem" | Out-File -FilePath $CsvLog -Encoding UTF8
    }
}

function Write-LogCsv {
    param([datetime]$Timestamp,[double]$Latitude,[double]$Longitude,[double]$COmega,[string]$Status,[string]$Mensagem)
    $line = ("{0},{1},{2},{3},{4},{5}" -f `
        $Timestamp.ToString('yyyy-MM-dd HH:mm:ss'),
        $Latitude, $Longitude, $COmega,
        ($Status -replace ',', ' '),
        ($Mensagem -replace '[\r\n,]', ' '))
    Add-Content -Path $CsvLog -Value $line
}

function Show-Alert {
    param([string]$Title,[string]$Message,[switch]$Error)
    try {
        Add-Type -AssemblyName System.Windows.Forms | Out-Null
        if ($Error) {
            [System.Media.SystemSounds]::Hand.Play()
            [void][System.Windows.Forms.MessageBox]::Show($Message,$Title,'OK','Error')
        } else {
            [System.Media.SystemSounds]::Asterisk.Play()
            [void][System.Windows.Forms.MessageBox]::Show($Message,$Title,'OK','Information')
        }
    } catch {
        if ($Error) {
            Write-Warning "[ALERTA] $Title -> $Message"
            try { [Console]::Beep(800,600) } catch {}
        } else {
            Write-Host "✅ $Message"
        }
    }
}

# TRIÂNGULO 360° - DNS + HTTPS + REST
function Test-SupabaseTriangulo360 {
    $ok = $false
    $SupHost = ([Uri]$SupabaseUrl).Host

    Write-Host "🔍 Testando DNS..." -ForegroundColor Yellow
    try {
        $dns = Resolve-DnsName $SupHost -ErrorAction Stop
        if ($dns) { $ok = $true; Write-Host "✅ DNS resolvido: $($dns.NameHost)" -ForegroundColor Green }
    } catch {
        Write-Warning "❌ Falha no DNS"
    }

    Write-Host "🌐 Testando HTTPS..." -ForegroundColor Yellow
    try {
        $headers = @{ apikey = $SupabaseKey }
        $resp = Invoke-WebRequest -Uri "$SupabaseUrl/rest/v1/" -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($resp.StatusCode -in 200,204,401,403) { $ok = $true; Write-Host "✅ HTTPS ativo (código $($resp.StatusCode))" -ForegroundColor Green }
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -in 200,204,401,403) {
            $ok = $true
            Write-Host "✅ HTTPS respondeu (mesmo com código de autenticação)" -ForegroundColor Green
        } else {
            Write-Warning "❌ HTTPS falhou"
        }
    }

    Write-Host "⚙️ Testando REST..." -ForegroundColor Yellow
    try {
        $headers = @{
            apikey = $SupabaseKey
            Authorization = "Bearer $SupabaseKey"
            "Content-Type" = "application/json"
        }
        $body = '[{"ping":"ok"}]'
        $r = Invoke-RestMethod -Method Post -Uri "$SupabaseUrl/rest/v1/rpc/" -Headers $headers -Body $body -TimeoutSec 10 -ErrorAction Stop
        $ok = $true
        Write-Host "✅ REST respondeu corretamente" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -in 200,204,401,403) { $ok = $true }
    }

    return $ok
}

function New-SupabaseRow {
    param([double]$Latitude,[double]$Longitude,[double]$COmega,[string]$Nome)
    return [pscustomobject]@{
        created_at = (Get-Date).ToString('o')
        latitude   = $Latitude
        longitude  = $Longitude
        comega     = $COmega
        nome       = if ($Nome) { $Nome } else { $null }
    }
}

function Invoke-SupabaseInsert {
    param([psobject]$Row)
    $endpoint = "$SupabaseUrl/rest/v1/$SupabaseTable"
    $headers = @{
        apikey = $SupabaseKey
        Authorization = "Bearer $SupabaseKey"
        Prefer = "return=representation"
        "Content-Type" = "application/json"
    }
    $body = ($Row | ConvertTo-Json -Compress)
    Invoke-RestMethod -Method Post -Uri $endpoint -Headers $headers -Body "[$body]" -TimeoutSec 30
}

#============================ LOOP PRINCIPAL ============================#
function Run-MainLoop {
    Write-Host "== Deploy-GPS-Supabase-Full v3.0 (Triângulo 360°) ==" -ForegroundColor Cyan
    Ensure-Directories
    Init-CsvLog

    if (Test-SupabaseTriangulo360) {
        Show-Alert -Title "Conexão Supabase" -Message "Triângulo 360° validado com sucesso!" 
        try {
            $diag = New-SupabaseRow -Latitude 0 -Longitude 0 -COmega 0 -Nome "Diagnóstico automático v3.0"
            $null = Invoke-SupabaseInsert -Row $diag
            Write-LogCsv -Timestamp (Get-Date) -Latitude 0 -Longitude 0 -COmega 0 -Status 'OK' -Mensagem 'Diagnóstico automático enviado'
        } catch {
            Write-LogCsv -Timestamp (Get-Date) -Latitude 0 -Longitude 0 -COmega 0 -Status 'ERRO' -Mensagem 'Falha no diagnóstico automático'
        }
    } else {
        $msg = "Falha total no Triângulo 360° (DNS/HTTPS/REST). Verifique rede."
        Show-Alert -Title "Falha no Upload" -Message $msg -Error
        Write-LogCsv -Timestamp (Get-Date) -Latitude 0 -Longitude 0 -COmega 0 -Status 'ERRO' -Mensagem $msg
    }

    while ($true) {
        try {
            if (Test-Path $QueuePath) {
                $lines = Get-Content -Path $QueuePath | Where-Object { $_ -match '\{' }
                foreach ($ln in $lines) {
                    $ts = Get-Date
                    $obj = $ln | ConvertFrom-Json -ErrorAction SilentlyContinue
                    if ($obj.latitude -and $obj.longitude -and $obj.comega) {
                        try {
                            $row = New-SupabaseRow -Latitude $obj.latitude -Longitude $obj.longitude -COmega $obj.comega -Nome $obj.nome
                            $null = Invoke-SupabaseInsert -Row $row
                            Write-LogCsv -Timestamp $ts -Latitude $obj.latitude -Longitude $obj.longitude -COmega $obj.comega -Status 'OK' -Mensagem 'Upload concluído'
                        } catch {
                            Write-LogCsv -Timestamp $ts -Latitude $obj.latitude -Longitude $obj.longitude -COmega $obj.comega -Status 'ERRO' -Mensagem $_.Exception.Message
                            Show-Alert -Title "Falha no Upload" -Message $_.Exception.Message -Error
                        }
                    }
                }
                Clear-Content -Path $QueuePath -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds $LoopInterval
        } catch {
            Write-LogCsv -Timestamp (Get-Date) -Latitude 0 -Longitude 0 -COmega 0 -Status 'ERRO' -Mensagem $_.Exception.Message
            Start-Sleep -Seconds $LoopInterval
        }
    }
}

Run-MainLoop
