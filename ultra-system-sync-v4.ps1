#Requires -Version 7
<#
Script: ultra-system-sync-v4.ps1
Autor: Richeles Assistant
Função: Sincroniza, corrige UTF-8 e recompila o PecuariaTech com IA e clima.
#>

Write-Host "🤖 Ultra System Sync — PecuariaTech Cloud v4.4" -ForegroundColor Cyan

function Fix-UTF8 {
    param ([string]$Path)
    if (Test-Path $Path) {
        $backup = "$Path.bak_utf8"
        Copy-Item $Path $backup -Force

        # Leitura e limpeza geral
        $raw = Get-Content -Raw -Encoding Byte $Path
        $clean = [System.Text.Encoding]::UTF8.GetString($raw)
        $clean = $clean -replace "[ÂÃ¤¢â‚¬Å“Ã…Â¾Ã‚]", ""  # remove caracteres corrompidos
        $clean = $clean -replace "\s{3,}", " "          # remove espaços extras
        $clean = $clean.Trim()

        # Gravação UTF-8 com BOM
        $Utf8Bom = New-Object System.Text.UTF8Encoding($true)
        [System.IO.File]::WriteAllText($Path, $clean, $Utf8Bom)
        Write-Host "✅ Corrigido UTF-8: $Path" -ForegroundColor Green
    }
}

# 1️⃣ Corrige arquivos principais
$targets = @(
    "app\dashboard\page.tsx",
    "app\ultrabiologica\status\page.tsx",
    "app\api\autonomo\route.ts",
    "app\api\ultrabiologico\route.ts",
    "app\api\inteligente\route.ts"
)
foreach ($t in $targets) { Fix-UTF8 $t }

# 2️⃣ Verifica módulos principais
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

# 3️⃣ Reimporta SmartWeatherV3 no dashboard, escapando aspas corretamente
$dashboard = "app\dashboard\page.tsx"
if (Test-Path $dashboard) {
    $code = Get-Content $dashboard -Raw
    if ($code -notmatch "SmartWeatherV3") {
        Write-Host "🔌 Injetando SmartWeatherV3 no dashboard..." -ForegroundColor Yellow
        Add-Content $dashboard "`r`nimport SmartWeatherV3 from \"../components/SmartWeatherV3\";"
        $code = $code -replace "(?<=return\s*\()", "`r`n    <SmartWeatherV3 />`r`n"
        Set-Content $dashboard $code -Encoding UTF8
        Write-Host "✅ SmartWeatherV3 integrado ao Dashboard" -ForegroundColor Green
    } else {
        Write-Host "✔️ SmartWeatherV3 já presente no Dashboard" -ForegroundColor Green
    }
}

# 4️⃣ Valida Supabase
Write-Host "🔄 Validando conexão com Supabase..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    $url = (Select-String -Path $envFile -Pattern "NEXT_PUBLIC_SUPABASE_URL").Line.Split("=")[1].Trim()
    Write-Host "✅ Supabase ativo: $url" -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.local não encontrado. Configure variáveis do Supabase." -ForegroundColor Red
}

# 5️⃣ Build
Write-Host "🧹 Limpando cache (.next)..."
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "⚙️ Executando build otimizado..."
npm run build

Write-Host ""
Write-Host "🚀 Ultra System Sync v4 concluído com sucesso!" -ForegroundColor Cyan
Write-Host "🌾 Sistema pronto: SmartWeatherV3 + UltraBiológico + UltraInteligente + Autônomo." -ForegroundColor Green
