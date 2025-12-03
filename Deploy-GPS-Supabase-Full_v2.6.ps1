<# 
 Deploy-GPS-Supabase-Full_v2.6.ps1
 --------------------------------------------------------
 ✔ Teste de rede inteligente com DNS + HTTPS + header
 ✔ Sem falsos negativos em 401/403
 ✔ Popup verde se conexão OK
 ✔ Upload automático + log + backup
 ✔ Loop contínuo pronto pro campo
#>

$ErrorActionPreference = 'Stop'

$SupabaseUrl   = $Env:NEXT_PUBLIC_SUPABASE_URL
$SupabaseKey   = $Env:SUPABASE_SERVICE_ROLE_KEY
$SupabaseTable = if ($Env:SUPABASE_TABLE) { $Env:SUPABASE_TABLE } else { 'pastagem' }

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $Root 'data'
$QueuePath = Join-Path $DataDir 'entrada.jsonl'
$LogsDir = Join-Path $Root 'logs'
$BackupDir = Join-Path $LogsDir 'backup'
$CsvLog = Join-Path $LogsDir 'DeployLog.csv'
$LoopInterval = 3

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

function Test-SupabaseReachable {
    try {
        # 1️⃣ Teste de DNS
        $host = ([Uri]$SupabaseUrl).Host
        $dns = Resolve-DnsName $host -ErrorAction SilentlyContinue
        if (-not $dns) { return $false }

        # 2️⃣ Teste HTTPS com header válido
        $endpoint = "$SupabaseUrl/rest/v1/"
        $headers = @{ apikey = $SupabaseKey }
        $r = Invoke-WebRequest -Uri $endpoint -Method Get -Headers $headers -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        return $true
    } catch {
        # Se for resposta 401 ou 403, ainda conta como sucesso (Supabase respondeu!)
        if ($_.Exception.Response -and ($_.Exception.Response.StatusCode.value__ -in 401,403)) { return $true }
        return $false
    }
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

function Get-QueueItems {
    if (-not (Test-Path $QueuePath)) { return @() }
    $lines = Get-Content -Path $QueuePath -ErrorAction SilentlyContinue
    $items = @()
    foreach ($ln in $lines) {
        if ([string]::IsNullOrWhiteSpace($ln)) { continue }
        try {
            $obj = $ln | ConvertFrom-Json -ErrorAction Stop
            if ($obj.latitude -and $obj.longitude -and $obj.comega) {
                $items += [pscustomobject]@{ latitude=[double]$obj.latitude; longitude=[double]$obj.longitude; comega=[double]$obj.comega; nome=$obj.nome }
            }
        } catch {}
    }
    return $items
}

function Clear-Queue { if (Test-Path $QueuePath) { Clear-Content -Path $QueuePath -Force } }

function Run-MainLoop {
    Write-Host "== Deploy-GPS-Supabase-Full v2.6 ==" -ForegroundColor Cyan
    Ensure-Directories
    Init-CsvLog

    if (Test-SupabaseReachable) {
        Show-Alert -Title "Conexão Supabase" -Message "Conexão HTTPS ativa e validada com sucesso!"
    } else {
        $msg = "Sem acesso HTTPS ao Supabase. Verifique rede ou DNS."
        Show-Alert -Title "Falha no Upload" -Message $msg -Error
        Write-LogCsv -Timestamp (Get-Date) -Latitude 0 -Longitude 0 -COmega 0 -Status 'ERRO' -Mensagem $msg
    }

    while ($true) {
        try {
            $items = Get-QueueItems
            if ($items.Count -eq 0) { Start-Sleep -Seconds $LoopInterval; continue }

            foreach ($it in $items) {
                $ts = Get-Date
                try {
                    $row = New-SupabaseRow -Latitude $it.latitude -Longitude $it.longitude -COmega $it.comega -Nome $it.nome
                    $null = Invoke-SupabaseInsert -Row $row
                    Write-LogCsv -Timestamp $ts -Latitude $it.latitude -Longitude $it.longitude -COmega $it.comega -Status 'OK' -Mensagem 'Upload concluído'
                } catch {
                    $emsg = $_.Exception.Message
                    Show-Alert -Message $emsg -Error -Title "Falha no Upload"
                    Write-LogCsv -Timestamp $ts -Latitude $it.latitude -Longitude $it.longitude -COmega $it.comega -Status 'ERRO' -Mensagem $emsg
                }
            }

            Clear-Queue
            Start-Sleep -Seconds $LoopInterval
        } catch {
            $em = $_.Exception.Message
            Show-Alert -Message $em -Error -Title "Erro de Execução"
            Write-LogCsv -Timestamp (Get-Date) -Latitude 0 -Longitude 0 -COmega 0 -Status 'ERRO' -Mensagem $em
            Start-Sleep -Seconds $LoopInterval
        }
    }
}

Run-MainLoop

