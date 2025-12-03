# Caminho do script
$scriptPath = "C:\Users\Administrador\pecuariatech\scripts\ultrabiologica_cloud_final.ps1"

# Cria script blindado
@"
# Ultrabiologica Cloud - Script final blindado
Write-Host "=== Ultrabiologica Cloud iniciado ==="

# --- Configura caminhos ---
\$ProjectPath = "C:\Users\Administrador\pecuariatech"
\$ScriptsDir  = Join-Path \$ProjectPath "scripts"
\$LogDir      = Join-Path \$ScriptsDir "logs"

if (-not (Test-Path \$LogDir)) { New-Item -ItemType Directory -Path \$LogDir -Force | Out-Null }
\$ts = (Get-Date).ToString("yyyyMMdd_HHmmss")
\$LogFile = Join-Path \$LogDir ("ultrabiologica_final_" + \$ts + ".log")
New-Item -Path \$LogFile -ItemType File -Force | Out-Null

function Log(\$level, \$msg) {
    \$line = "[" + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss") + "][" + \$level + "] " + \$msg
    Add-Content -Path \$LogFile -Value \$line -Encoding utf8
    Write-Host \$line
}

Log "INFO" "Script iniciado"

# --- Checa .env.local ---
\$envFile = Join-Path \$ProjectPath ".env.local"
if (-not (Test-Path \$envFile)) {
    Log "ERROR" ".env.local não encontrado. Crie e preencha antes de rodar."
    exit 1
}
Get-Content \$envFile | ForEach-Object {
    if (\$_ -match "^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$") {
        [System.Environment]::SetEnvironmentVariable(\$matches[1],\$matches[2].Trim())
    }
}
Log "OK" ".env.local carregado"

# --- Criação de pastas mínimas ---
\$paths = @('app\api\forecast_clima','app\api\predict_weight','app\api\ultrachat','app\ultrabiologica\status','components','public')
foreach (\$p in \$paths) {
    \$full = Join-Path \$ProjectPath \$p
    if (-not (Test-Path \$full)) { New-Item -ItemType Directory -Path \$full -Force | Out-Null; Log "OK" "Criada pasta: \$p" }
}

# --- Componentes placeholders necessários ---
\$componentNames = @(
    'UltraChatAgro.tsx',
    'SWRegister.tsx',
    'Header.tsx',
    'Sidebar.tsx',
    'Dashboard.tsx',
    'Footer.tsx'
)

foreach (\$c in \$componentNames) {
    \$path = Join-Path \$ProjectPath ("components\" + \$c)
    if (-not (Test-Path \$path)) {
        \$content = @"
"use client"
import React from 'react';
export default function {0}(){{ return (<div>{0} placeholder</div>); }}
"@ -f [System.IO.Path]::GetFileNameWithoutExtension(\$c)
        Set-Content -Path \$path -Value \$content -Encoding utf8 -Force
        Log "OK" "Componente placeholder criado: \$c"
    }
}

# --- APIs mínimas ---
\$apis = @(
    @{path='app\api\forecast_clima\route.ts'; content='export async function GET(){ return NextResponse.json({ok:true,message:"forecast_clima API placeholder"}); }'},
    @{path='app\api\predict_weight\route.ts'; content='export async function POST(){ return NextResponse.json({ok:true,message:"predict_weight API placeholder"}); }'},
    @{path='app\api\ultrachat\route.ts'; content='export async function POST(){ return NextResponse.json({ok:true,message:"ultrachat API placeholder"}); }'}
)

foreach (\$api in \$apis) {
    \$full = Join-Path \$ProjectPath \$api.path
    \$dir = Split-Path \$full
    if (-not (Test-Path \$dir)) { New-Item -ItemType Directory -Path \$dir -Force | Out-Null }
    $content = @"
import { NextResponse } from 'next/server';
$($api.content)
"@
    Set-Content -Path $full -Value $content -Encoding utf8 -Force
    Log "OK" "API criada: $($api.path)"
}

# --- Status page ---
\$statusPage = Join-Path \$ProjectPath 'app\ultrabiologica\status\page.tsx'
if (-not (Test-Path \$statusPage)) {
    \$content = @"
"use client"
import React from 'react';
export default function StatusPage(){ return (<div>Status placeholder</div>); }
"@
    Set-Content -Path \$statusPage -Value \$content -Encoding utf8 -Force
    Log "OK" "Status page criada"
}

# --- package.json mínimo ---
\$pkgFile = Join-Path \$ProjectPath 'package.json'
if (-not (Test-Path \$pkgFile)) {
    \$pkgContent = @'
{
  "name": "pecuariatech",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build"
  }
}
'@
    Set-Content -Path \$pkgFile -Value \$pkgContent -Encoding utf8 -Force
    Log "OK" "package.json criado"
}

# --- npm install e build ---
Set-Location \$ProjectPath
try { & npm install 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath \$LogFile -Append -Encoding utf8 }; Log "OK" "npm install concluído" } catch { Log "WARN" "npm install falhou" }
try { & npm run build 2>&1 | ForEach-Object { $_; $_ | Out-File -FilePath \$LogFile -Append -Encoding utf8 }; Log "OK" "Build concluído" } catch { Log "WARN" "Build falhou" }

Log "INFO" "Script finalizado. Log: \$LogFile"
"@ | Set-Content -Path $scriptPath -Encoding utf8 -Force

Write-Host "Arquivo criado e pronto para rodar: $scriptPath"
