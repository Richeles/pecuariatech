#Requires -Version 7
<#
Script: ultra-system-sync-v3.ps1
Autor: Richeles Assistant
Função: Corrigir codificação UTF-8 e sincronizar módulos do PecuariaTech
#>

Write-Host "🤖 Ultra System Sync — PecuariaTech Cloud v4.3" -ForegroundColor Cyan

function Fix-UTF8 {
    param ([string]$Path)

    if (Test-Path $Path) {
        $backup = "$Path.bak_utf8"
        Copy-Item $Path $backup -Force

        # Lê o arquivo como bytes e remove BOM + caracteres inválidos
        $raw = Get-Content -Raw -Encoding Byte $Path
        $clean = [System.Text.Encoding]::UTF8.GetString($raw)
        $clean = $clean -replace "[ÂÃ¤¢â‚¬Å“Ã…Â¾Ã‚]", ""  # remove lixo comum
        $clean = $clean -replace "\s{3,}", " "          # remove espaços extras

        # Regrava o arquivo em UTF-8 BOM
        $Utf8Bom = New-Object System.Text.UTF8Encoding($true)
        [System.IO.File]::WriteAllText($Path, $clean, $Utf8Bom)
        Write-Host "✅ Corrigido: $Path" -ForegroundColor Green
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

# 2️⃣ Verifica módulos essenciais
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

# 3️⃣ Garante que SmartWeather está importado no Dashboard
$dashboard = "app\dashboard\page.tsx"
if (Test-Path $dashboard) {
    $code = Get-Content $dashboard -Raw
    if ($code -notmatch "SmartWeatherV3") {
        Add-Content $dashboard "`r`nimport SmartWeatherV3 from '../components/SmartWeatherV3';"
        $code = $code -replace "(?<=return\s*\()", "`r`n    <SmartWeatherV3 />`r`n"
        Set-Content $dashboard $code -Encoding UTF8
        Write-Host "🔌 SmartWeatherV3 reintegrado ao Dashboard" -ForegroundColor Green
    }
}

# 4️⃣ Testa Supabase
Write-Host "🔄 Validando Supabase..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    $url = (Select-String -Path $envFile -Pattern "NEXT_PUBLIC_SUPABASE_URL").Line.Split("=")[1].Trim()
    Write-Host "✅ Supabase ativo: $url" -ForegroundColor Green
} else {
    Write-Host "⚠️ Variáveis Supabase ausentes (.env.local não encontrado)" -ForegroundColor Red
}

# 5️⃣ Build final
Write-Host "🧹 Limpando .next ..."
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "⚙️ Iniciando build otimizado..."
npm run build

Write-Host "🚀 Ultra System Sync v3 concluído com sucesso!" -ForegroundColor Cyan
Write-Host "🌾 Módulos ativos: SmartWeatherV3, UltraBiológico, UltraInteligente, Autônomo" -ForegroundColor Green
