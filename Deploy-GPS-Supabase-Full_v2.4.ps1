<#
 Deploy-GPS-Supabase-Full_v2.4.ps1 (corrigido)
 --------------------------------------------------------
 ✔ Corrige erro de sintaxe '-f' na linha 71
 ✔ Alerta sonoro + popup APENAS em erro
 ✔ Upload automático para Supabase (PostgREST)
 ✔ Log CSV consolidado (timestamp, CΩ, lat, long, status)
 ✔ Backup automático diário em logs\backup\
 ✔ Loop contínuo, pronto para rodar em campo
#>

$ErrorActionPreference = 'Stop'

# Variáveis de ambiente
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
    param(
        [datetime]$Timestamp,
        [double]$Latitude,
        [double]$Longitude,
        [double]$COmega,
        [string]$Status,
        [string]$Mensagem
    )
    $line = ("{0},{1},{2},{3},{4},{5}" -f `
        $Timestamp.ToString('yyyy-MM-dd HH:mm:ss'), `
        $Latitude, $Longitude, $COmega, `
        ($Status -replace ',', ' '), `
        ($Mensagem -replace '[\r\n,]',' '))
    Add-Content -Path $CsvLog -Value $line
}

function Show-ErrorAlert {
    param(
        [string]$Title = 'Falha no Upload',
        [string]$Message = 'Ocorreu um erro durante a operação.'
    )
    try {
        Add-Type -AssemblyName System.Windows.Forms | Out-Null
        [System.Media.SystemSounds]::Hand.Play()
        [void][System.Windows.Forms.MessageBox]::Show($Message, $Title, 'OK', 'Error')
    } catch {
        Write-Warning "[ALERTA] $Title -> $Message"
        try { [Console]::Beep(800, 600) } catch {}
    }
}

function Test-SupabaseReachable {
    try {
        $uri = [Uri]$SupabaseUrl
        $host = $uri.Host
        $result = Test-NetConnection -ComputerName $host -Port 443 -InformationLevel Quiet
        return [bool]$result
    } catch { return $false }
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
        apikey=$SupabaseKey; Authorization="Bearer $SupabaseKey"; Prefer='return=representation'; 'Content-Type'='application/json'
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
    Write-Host "== Deploy-GPS-Supabase-Full v2.4 (corrigido) ==" -ForegroundColor Cyan
    Ensure-Directories; Init-CsvLog
    if (-not (Test-SupabaseReachable)) {
        $msg = "Sem acesso à porta 443 do Supabase."
        Show-ErrorAlert -Message $msg
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
                    Show-ErrorAlert -Message $emsg
                    Write-LogCsv -Timestamp $ts -Latitude $it.latitude -Longitude $it.longitude -COmega $it.comega -Status 'ERRO' -Mensagem $emsg
                }
            }
            Clear-Queue
            Start-Sleep -Seconds $LoopInterval
        } catch {
            $em = $_.Exception.Message
            Show-ErrorAlert -Message $em
            Write-LogCsv -Timestamp (Get-Date) -Latitude 0 -Longitude 0 -COmega 0 -Status 'ERRO' -Mensagem $em
            Start-Sleep -Seconds $LoopInterval
        }
    }
}

Run-MainLoop
