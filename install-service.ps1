# =====================================================================
# PecuariaTech • UniScript Service v24.3
# Instalador / Gerenciador do Serviço do Windows
# Serviço: PecuariaTech-UniScript
# =====================================================================

param(
    [ValidateSet("install","uninstall","start","stop","status")]
    [string]$Action = "install"
)

$ErrorActionPreference = "Stop"

# NOME DO SERVIÇO (mesmo do pecuariatech-service.ps1)
$ServiceName  = "PecuariaTech-UniScript"
$DisplayName  = "PecuariaTech UniScript"
$Description  = "Monitoramento 24/7 PecuariaTech com Triângulo360, Supabase, GPS, Deploy e WhatsApp."

# Caminho da pasta onde este script está
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ServiceScriptPath = Join-Path $ScriptDir "pecuariatech-service.ps1"

if (-not (Test-Path $ServiceScriptPath)) {
    Write-Host "ERRO: Arquivo pecuariatech-service.ps1 não encontrado em: $ServiceScriptPath" -ForegroundColor Red
    exit 1
}

# Comando que o serviço vai executar
$BinaryPath = "powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$ServiceScriptPath`""

function Require-Admin {
    $currentIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object System.Security.Principal.WindowsPrincipal($currentIdentity)
    if (-not $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Host "Este script precisa ser executado como ADMINISTRADOR." -ForegroundColor Yellow
        Write-Host "Clique com o botão direito em 'Windows PowerShell' → 'Executar como administrador' e rode novamente." -ForegroundColor Yellow
        exit 1
    }
}

function Install-Service {
    Require-Admin

    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

    if ($svc) {
        Write-Host "Serviço '$ServiceName' já existe. Atualizando caminho do script..." -ForegroundColor Yellow
        $regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName"
        Set-ItemProperty -Path $regPath -Name ImagePath -Value $BinaryPath
    } else {
        Write-Host "Criando serviço '$ServiceName'..." -ForegroundColor Cyan
        New-Service -Name $ServiceName -DisplayName $DisplayName -BinaryPathName $BinaryPath -StartupType Automatic | Out-Null

        # Descrição (via registro)
        $regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName"
        New-ItemProperty -Path $regPath -Name "Description" -Value $Description -PropertyType String -Force | Out-Null
    }

    Write-Host "Iniciando serviço..." -ForegroundColor Cyan
    Start-Service -Name $ServiceName

    Write-Host "---------------------------------------------" -ForegroundColor Green
    Write-Host "Serviço instalado e iniciado com sucesso!" -ForegroundColor Green
    Write-Host "Nome do serviço: $ServiceName" -ForegroundColor Green
    Write-Host "Início automático com o Windows: HABILITADO" -ForegroundColor Green
    Write-Host "---------------------------------------------" -ForegroundColor Green
}

function Uninstall-Service {
    Require-Admin

    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

    if (-not $svc) {
        Write-Host "Serviço '$ServiceName' não existe." -ForegroundColor Yellow
        return
    }

    if ($svc.Status -ne "Stopped") {
        Write-Host "Parando serviço '$ServiceName'..." -ForegroundColor Cyan
        Stop-Service -Name $ServiceName -Force
    }

    Write-Host "Removendo serviço '$ServiceName'..." -ForegroundColor Cyan
    sc.exe delete "$ServiceName" | Out-Null

    Write-Host "Serviço removido." -ForegroundColor Green
}

function Start-MyService {
    Require-Admin
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Host "Serviço '$ServiceName' não existe. Rode com Action=install primeiro." -ForegroundColor Yellow
        return
    }

    if ($svc.Status -eq "Running") {
        Write-Host "Serviço '$ServiceName' já está em execução." -ForegroundColor Green
        return
    }

    Start-Service -Name $ServiceName
    Write-Host "Serviço '$ServiceName' iniciado." -ForegroundColor Green
}

function Stop-MyService {
    Require-Admin
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Host "Serviço '$ServiceName' não existe." -ForegroundColor Yellow
        return
    }

    if ($svc.Status -eq "Stopped") {
        Write-Host "Serviço '$ServiceName' já está parado." -ForegroundColor Green
        return
    }

    Stop-Service -Name $ServiceName -Force
    Write-Host "Serviço '$ServiceName' parado." -ForegroundColor Green
}

function Show-Status {
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Host "Serviço '$ServiceName' não existe." -ForegroundColor Yellow
        return
    }

    Write-Host "---------------------------------------------"
    Write-Host " Serviço:   $ServiceName"
    Write-Host " Display:   $DisplayName"
    Write-Host " Status:    $($svc.Status)"
    Write-Host " Tipo ini.: $($svc.StartType)"
    Write-Host "---------------------------------------------"
}

switch ($Action) {
    "install"   { Install-Service }
    "uninstall" { Uninstall-Service }
    "start"     { Start-MyService }
    "stop"      { Stop-MyService }
    "status"    { Show-Status }
}

