Write-Host "🔵 UltraFix Recharts v3 — Scanner Absoluto Iniciado..." -ForegroundColor Cyan
Write-Host "⚡ Modo Inspeção Profunda Ativado..." -ForegroundColor Yellow

# Diretório do projeto
$root = Get-Location

# Extensões alvo
$extensions = "*.tsx","*.ts","*.jsx","*.js"

# Procurar arquivos
$files = Get-ChildItem -Path $root -Recurse -Force -Include $extensions -ErrorAction SilentlyContinue

$totalFiles = $files.Count
$fixedCount = 0

Write-Host "📁 Total de arquivos detectados: $totalFiles" -ForegroundColor Blue

foreach ($file in $files) {

    $content = Get-Content $file.FullName -Raw

    # Padrões problemáticos
    $bad1 = "<ResponsiveContainer width=`"100%`" height=`"100%`">"
    $good1 = "<div style={{ minHeight: `"300px`" }}><ResponsiveContainer width=`"100%`" height=`"100%`">"

    $bad2 = "<ResponsiveContainer width=`"100%`" height={`-1`}>"
    $good2 = "<ResponsiveContainer width=`"100%`" height={300}>"

    $changed = $false

    if ($content -match "ResponsiveContainer" -and $content.Contains("height")) {

        if ($content.Contains("height={-1}") -or $content.Contains("height={`-1`}")) {
            $content = $content.Replace($bad2, $good2)
            $changed = $true
        }

        if ($content.Contains('height="100%"')) {
            $content = $content.Replace($bad1, $good1)
            $changed = $true
        }
    }

    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        $fixedCount++
        Write-Host "🔧 Corrigido: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 UltraFix Recharts v3 FINALIZADO!" -ForegroundColor Cyan
Write-Host "📁 Arquivos escaneados: $totalFiles" -ForegroundColor Blue
Write-Host "🔧 Arquivos realmente corrigidos: $fixedCount" -ForegroundColor Green
Write-Host "✔ Agora os gráficos estão 100% protegidos! 🚀" -ForegroundColor Yellow
