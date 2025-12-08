Write-Host "🔵 UltraFix Recharts v4.1 — Telemetria Ativada..." -ForegroundColor Cyan
Write-Host "⚡ UltraScan Inteligente (Ignorando node_modules, .next, dist, build)..." -ForegroundColor Yellow
Write-Host ""

$root = Get-Location
$validFolders = @("app", "components", "src", "modules")
$extensions = "*.tsx","*.ts","*.jsx","*.js"

function ShouldProcessFile($path) {
    $lower = $path.ToLower()
    return (
        ($validFolders | ForEach-Object { $lower -match "\\$_\\" }) -and
        ($lower -notmatch "node_modules") -and
        ($lower -notmatch "\.next") -and
        ($lower -notmatch "public") -and
        ($lower -notmatch "dist") -and
        ($lower -notmatch "build") -and
        ($lower -notmatch "\.vercel") -and
        ($lower -notmatch "out")
    )
}

Write-Host "🔍 Escaneando arquivos válidos..." -ForegroundColor Blue

$files = Get-ChildItem -Path $root -Recurse -Force -Include $extensions -ErrorAction SilentlyContinue

$filtered = @()
foreach ($file in $files) {
    if (ShouldProcessFile $file.FullName) {
        $filtered += $file
    }
}

$total = $filtered.Count
Write-Host "📁 Arquivos React relevantes encontrados: $total" -ForegroundColor Cyan
Write-Host ""

$i = 0
$fixed = 0

foreach ($file in $filtered) {

    $i++
    Write-Host "📡 ($i / $total) Escaneando: $($file.Name)" -ForegroundColor DarkGray

    $content = Get-Content $file.FullName -Raw

    if ($content -match "ResponsiveContainer") {

        $changed = $false

        if ($content -match "height=\{\-1\}") {
            $content = $content -replace "height=\{\-1\}", "height={300}"
            $changed = $true
        }

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
Write-Host "🎉 UltraFix Recharts v4.1 FINALIZADO!" -ForegroundColor Cyan
Write-Host "📁 Arquivos analisados: $total"
Write-Host "🔧 Arquivos corrigidos: $fixed" -ForegroundColor Green
Write-Host "🚀 Agora todos os gráficos estão protegidos!" -ForegroundColor Yellow
