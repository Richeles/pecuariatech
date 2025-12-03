Write-Host "Ultrabiologica Cloud v5.4 iniciado..."

# Configura caminhos
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$ScriptsDir  = Join-Path $ProjectPath "scripts"
$LogDir      = Join-Path $ScriptsDir "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

# Cria log
$ts = (Get-Date).ToString("yyyyMMdd_HHmmss")
$LogFile = Join-Path $LogDir ("ultrabiologica_v5.4_" + $ts + ".log")
New-Item -Path $LogFile -ItemType File -Force | Out-Null

function Log($level, $msg) {
    $line = "[" + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss") + "][" + $level + "] " + $msg
    Add-Content -Path $LogFile -Value $line -Encoding utf8
    Write-Host $line
}

Log "INFO" "Script iniciado"

# Verifica .env.local
$envFile = Join-Path $ProjectPath ".env.local"
if (-not (Test-Path $envFile)) { 
    Log "ERROR" ".env.local não encontrado. Crie e preencha antes de rodar."
    exit 1
}
Get-Content $envFile | ForEach-Object { 
    if ($_ -match "^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$") { 
        [System.Environment]::SetEnvironmentVariable($matches[1],$matches[2].Trim())
    } 
}
Log "OK" ".env.local carregado"

# Criação de pastas mínimas
$paths = @('app\api\forecast_clima','app\api\predict_weight','app\api\ultrachat','app\ultrabiologica\status','components','public')
foreach ($p in $paths) {
    $full = Join-Path $ProjectPath $p
    if (-not (Test-Path $full)) { 
        New-Item -ItemType Directory -Path $full -Force | Out-Null
        Log "OK" "Criada pasta: $p"
    }
}

# Placeholder UltraChat
$ultraComp = Join-Path $ProjectPath 'components\UltraChatAgro.tsx'
if (-not (Test-Path $ultraComp)) { 
Set-Content -Path $ultraComp -Value @'
"use client"
import React from "react";
export default function UltraChatAgro(){ return (<div>UltraChat placeholder</div>); }
'@ -Encoding utf8
    Log "WARN" "Placeholder UltraChat criado"
}

# APIs mínimas
$apiForecast = Join-Path $ProjectPath 'app\api\forecast_clima\route.ts'
Set-Content -Path $apiForecast -Value @'
import { NextResponse } from "next/server";
export async function GET(){ return NextResponse.json({ok:true,message:"forecast_clima API placeholder"}); }
'@ -Encoding utf8
Log "OK" "API forecast_clima criada"

$apiPredict = Join-Path $ProjectPath 'app\api\predict_weight\route.ts'
Set-Content -Path $apiPredict -Value @'
import { NextResponse } from "next/server";
export async function POST(){ return NextResponse.json({ok:true,message:"predict_weight API placeholder"}); }
'@ -Encoding utf8
Log "OK" "API predict_weight criada"

$apiChat = Join-Path $ProjectPath 'app\api\ultrachat\route.ts'
Set-Content -Path $apiChat -Value @'
import { NextResponse } from "next/server";
export async function POST(){ return NextResponse.json({ok:true,message:"ultrachat API placeholder"}); }
'@ -Encoding utf8
Log "OK" "API ultrachat criada"

# Status page
$statusPage = Join-Path $ProjectPath 'app\ultrabiologica\status\page.tsx'
Set-Content -Path $statusPage -Value @'
"use client"
import React from "react";
export default function StatusPage(){ return (<div>Status placeholder</div>); }
'@ -Encoding utf8
Log "OK" "Status page criada"

# package.json mínimo
$pkgFile = Join-Path $ProjectPath 'package.json'
if (-not (Test-Path $pkgFile)) {
Set-Content -Path $pkgFile -Value @'
{
  "name": "pecuariatech",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build"
  }
}
'@ -Encoding utf8
    Log "OK" "package.json criado"
}

# npm install e build
Set-Location $ProjectPath
try { & npm install 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }; Log "OK" "npm install concluído" } catch { Log "WARN" "npm install falhou" }
try { & npm run build 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath $LogFile -Append -Encoding utf8 }; Log "OK" "Build concluído" } catch { Log "WARN" "Build falhou" }

Log "INFO" "Script finalizado. Log: $LogFile"
