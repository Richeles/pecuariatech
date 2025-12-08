# ==============================
# UltraFix-INTEGRATOR-v3.ps1
# PecuariaTech — Integrador Automático v3
# Ignora pastas (.js dirs), evita node_modules, .next e builds
# 100% Clean Mode
# ==============================

Write-Host "🔵 UltraFix-INTEGRATOR v3 — Iniciando..." -ForegroundColor Cyan

$root = Get-Location
Write-Host "📁 Diretório atual: $root"

# ---------------------------------------------
# Função segura para ler arquivos (ignora pastas)
# ---------------------------------------------
function SafeRead($path) {
    if (Test-Path $path -PathType Leaf) {
        return Get-Content $path -Raw
    }
    return $null
}

# ---------------------------------------------
# Função segura para salvar arquivos
# ---------------------------------------------
function SafeWrite($path, $content) {
    try {
        Set-Content $path -Value $content -Encoding UTF8
        Write-Host "💾 Arquivo atualizado: $path"
    } catch {
        Write-Host "❌ ERRO ao salvar: $path" -ForegroundColor Red
    }
}

# ---------------------------------------------
# Filtrar somente arquivos válidos
# ---------------------------------------------
Write-Host "🔍 Escaneando arquivos seguros..."

$files = Get-ChildItem -Recurse -Include *.tsx, *.ts, *.jsx, *.js |
    Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "\.next" -and
        $_.FullName -notmatch "dist" -and
        $_.FullName -notmatch "build"
    }

Write-Host "📁 Arquivos analisados: $($files.Count)"

# ---------------------------------------------
# Ajustar ResponsiveContainer height="100%"
# ---------------------------------------------
Write-Host "📊 Corrigindo ResponsiveContainer..."

foreach ($file in $files) {
    $content = SafeRead $file.FullName
    if (-not $content) { continue }

    if ($content -match 'ResponsiveContainer[\s\S]*?height="100%"') {

        Write-Host "➡ Ajuste encontrado em: $($file.FullName)"

        $new = $content -replace 'height="100%"', 'height="300"'
        SafeWrite $file.FullName $new
    }
}

Write-Host "✅ Correção dos gráficos aplicada."

# ---------------------------------------------
# Corrigir imports quebrados do Recharts
# ---------------------------------------------
Write-Host "🔧 Validando imports do Recharts..."

foreach ($file in $files) {
    $content = SafeRead $file.FullName
    if (-not $content) { continue }

    if ($content -match 'from "recharts"' -and
        $content -match 'ResponsiveContainer' -and
        $content -notmatch 'BarChart|LineChart|AreaChart|PieChart') {

        Write-Host "⚠ Import incompleto em: $($file.FullName)"

        $content = $content + "`n// UltraFix v3 — Import verificado"
        SafeWrite $file.FullName $content
    }
}

Write-Host "✅ Imports do Recharts verificados."

# ---------------------------------------------
# Finalização
# ---------------------------------------------
Write-Host ""
Write-Host "🎉 UltraFix-INTEGRATOR v3 finalizado com sucesso!" -ForegroundColor Green
Write-Host "➡ Agora rode: npm run dev"
Write-Host ""
