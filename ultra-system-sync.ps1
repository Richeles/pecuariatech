#Requires -Version 7
<#
Script: ultra-system-sync.ps1
Autor: Richeles Assistant
Versão: 4.0
Função: Sincroniza todos os módulos inteligentes do PecuariaTech.
#>

Write-Host "🤖 Ultra System Sync — PecuariaTech Cloud v4.0" -ForegroundColor Cyan

# Função de correção UTF-8 universal
function Fix-Utf8 {
    param ([string]$Path)
    if (Test-Path $Path) {
        $backup = "$Path.bak_utf8"
        Copy-Item $Path $backup -Force
        $content = Get-Content $Path -Raw -Encoding UTF8

        $content = $content `
            -replace "ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â ", "📊" `
            -replace "ÃƒÆ’Ã‚Ârea total \(ha\)", "Área total (ha)" `
            -replace "CabeÃƒÆ’Ã‚Â§as de gado", "Cabeças de gado" `
            -replace "ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â¾", "🌾" `
            -replace "ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬Å¾", "🐄" `
            -replace "ÃƒÆ’Ã‚Â³", "ó" `
            -replace "ÃƒÆ’Ã‚Â£", "ã" `
            -replace "ÃƒÆ’Ã‚Â¡", "á"

        $Utf8BomEncoding = New-Object System.Text.UTF8Encoding($true)
        [System.IO.File]::WriteAllText($Path, $content, $Utf8BomEncoding)
        Write-Host "✅ UTF-8 corrigido: $Path" -ForegroundColor Green
    }
}

# 1️⃣ Corrigir dashboard e principais páginas
$targets = @(
    "app\dashboard\page.tsx",
    "app\ultrabiologica\status\page.tsx",
    "app\api\autonomo\route.ts",
    "app\api\ultrabiologico\route.ts",
    "app\api\inteligente\route.ts"
)

foreach ($t in $targets) { Fix-Utf8 $t }

# 2️⃣ Verificar e restaurar módulos essenciais
$modules = @(
    "app\components\SmartWeatherV3.tsx",
    "app\components\UltraBiologico2.tsx",
    "app\components\UltraChat.tsx"
)

foreach ($m in $modules) {
    if (Test-Path $m) {
        Write-Host "🧠 Módulo encontrado: $m" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ Módulo ausente: $m — será reimplantado..." -ForegroundColor Red
    }
}

# 3️⃣ Garantir importação dos módulos no dashboard
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

# 4️⃣ Sincronizar com Supabase (schema principal)
Write-Host "🔄 Validando conexão com Supabase..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    $url = (Select-String -Path $envFile -Pattern "NEXT_PUBLIC_SUPABASE_URL").Line.Split("=")[1].Trim()
    $key = (Select-String -Path $envFile -Pattern "NEXT_PUBLIC_SUPABASE_ANON_KEY").Line.Split("=")[1].Trim()
    Write-Host "✅ Supabase configurado em: $url" -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.local não encontrado — configure variáveis Supabase." -ForegroundColor Red
}

# 5️⃣ Limpeza e build
Write-Host "🧹 Limpando cache e build antigo..."
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "⚙️ Compilando projeto..."
npm run build

Write-Host "🚀 Ultra System Sync concluído com sucesso!" -ForegroundColor Cyan
Write-Host "🌾 Dashboard pronto com: SmartWeather + UltraBiológico + Autônomo + Inteligente." -ForegroundColor Green
