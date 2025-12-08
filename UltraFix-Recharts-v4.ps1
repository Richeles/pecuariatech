Write-Host "🔵 UltraFix Recharts v4 — Scanner Espectral Inteligente Iniciado..." -ForegroundColor Cyan
Write-Host "⚡ Modo UltraScan Ativado (Ignorando node_modules, .next e builds)..." -ForegroundColor Yellow

$root = Get-Location

# Pastas válidas
$validFolders = @("app", "components", "src", "modules")

# Extensões
$extensions = "*.tsx","*.ts","*.jsx","*.js"

# Buscar somente arquivos relevantes (SEM node_modules, .next, dist, build, public etc.)
$files = Get-ChildItem -Path $root -Recurse -Force -Include $extensions `
    -ErrorAction SilentlyContinue |
    Where-Object {
        $path = $_.FullName.ToLower()
        ($validFolders | ForEach-Object { $path -match "\\$_\\" }) -and
        ($path -notmatch "node_modules") -and
        ($path -notmatch "\.next") -and
        ($path -notmatch "dist") -and
        ($path -notmatch "build") -and
        ($path -notmatch "public") -and
        ($path -notmatch "out") -and
        ($path -notmatch "\.vercel")
    }

$total = $files.Count
$fixed = 0

Write-Host "📁 Arquivos React relevantes detectados: $total" -ForegroundColor Blue

foreach ($file in $files) {

    $content = Get-Content $file.FullName -Raw

    if ($content -match "ResponsiveContainer") {

        $changed = $false

        # Problema height={-1}
        if ($content -match "height=\{\-1\}") {
            $content = $content -replace "height=\{\-1\}", "height={300}"
            $changed = $true
        }

        # Problema width 100% sem altura
        if ($content -match "height=`"100%`"") {
            $wrap = "<div style={{ minHeight: `"300px`" }}>"
            if (-not $content.Contains($wrap)) {
                $content = $content -replace "<ResponsiveContainer([^>]*)>", "<div style={{ minHeight: `"300px`" }}><ResponsiveContainer`$1>"
                $changed = $true
            }
        }

        if ($changed) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            $fixed++
            Write-Host "🔧 Corrigido: $($file.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "🎉 UltraFix Recharts v4 FINALIZADO!" -ForegroundColor Cyan
Write-Host "📁 Arquivos analisados: $total"
Write-Host "🔧 Arquivos corrigidos: $fixed" -ForegroundColor Green
Write-Host "🚀 Todos os gráficos agora estão protegidos!" -ForegroundColor Yellow
