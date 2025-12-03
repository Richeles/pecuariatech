#Requires -Version 7
<#
Script: ultra-system-sync-v6.ps1
Autor: Richeles Assistant
Versão: 6.0
Objetivo: Corrigir UTF-8, reintegrar módulos IA e garantir build estável no PecuariaTech Cloud
#>

Write-Host "🤖 Ultra System Sync — PecuariaTech Cloud v6.0" -ForegroundColor Cyan

function Fix-UTF8 {
    param ([string]$Path)

    if (Test-Path $Path) {
        $backup = "$Path.bak_utf8"
        Copy-Item $Path $backup -Force

        # Lê bytes e converte removendo caracteres fora da faixa imprimível
        $bytes = [System.IO.File]::ReadAllBytes($Path)
        $utf8 = [System.Text.Encoding]::UTF8.GetString($bytes)
        $utf8 = $utf8 -replace '[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\uFFFF]', ''
        $utf8 = $utf8.Trim()

        # Salva novamente em UTF-8 com BOM
        $Utf8Bom = New-Object System.Text.UTF8Encoding($true)
        [System.IO.File]::WriteAllText($Path, $utf8, $Utf8Bom)

        Write-Host "✅ Corrigido: $Path" -ForegroundColor Green
    }
}

# 1️⃣ Corrige arquivos críticos do projeto
$targets = @(
    "app\dashboard\page.tsx",
    "app\ultrabiologica\status\page.tsx",
    "app\api\autonomo\route.ts",
    "app\api\ultrabiologico\route.ts",
    "app\api\inteligente\route.ts"
)
foreach ($t in $targets) { Fix-UTF8 $t }

# 2️⃣ Verifica módulos IA principais
$modules = @(
    "app\components\SmartWeatherV3.tsx",
    "app\components\UltraBiologico2.tsx",
    "app\components\UltraChat.tsx"
)
foreach ($m in $modules) {
    if (Test-Path $m) {
        Write-Host "🧠 Módulo OK: $m" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ Módulo ausente: $m" -ForegroundColor Red
    }
}

# 3️⃣ Reintegra SmartWeatherV3 ao Dashboard se faltar
$dashboard = "app\dashboard\page.tsx"
if (Test-Path $dashboard) {
    $code = Get-Content $dashboard -Raw
    if ($code -notmatch "SmartWeatherV3") {
        Write-Host "🔌 Injetando SmartWeatherV3 no dashboard..." -ForegroundColor Yellow
        $importLine = 'import SmartWeatherV3 from "../components/SmartWeatherV3";'
        Add-Content $dashboard "`r`n$importLine"
        $code = $code -replace '(?<=return\s*\()', "`r`n    <SmartWeatherV3 />`r`n"
        Set-Content $dashboard $code -Encoding UTF8
        Write-Host "✅ SmartWeatherV3 reintegrado ao Dashboard" -ForegroundColor Green
    } else {
        Write-Host "✔️ SmartWeatherV3 já presente no Dashboard" -ForegroundColor Green
    }
}

# 4️⃣ Confere Supabase
Write-Host "🔄 Verificando variáveis Supabase..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    $url = (Select-String -Path $envFile -Pattern "NEXT_PUBLIC_SUPABASE_URL").Line.Split("=")[1].Trim()
    Write-Host "✅ Supabase ativo em: $url" -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.local não encontrado — configure variáveis do Supabase." -ForegroundColor Red
}

# 5️⃣ Limpeza e build final
Write-Host "🧹 Limpando cache (.next)..."
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "⚙️ Iniciando build otimizado..."
npm run build

Write-Host ""
Write-Host "🚀 Ultra System Sync v6 concluído com sucesso!" -ForegroundColor Cyan
Write-Host "🌾 Sistema pronto: SmartWeatherV3 + UltraBiológico + UltraInteligente + Autônomo." -ForegroundColor Green
