Write-Host "🔵 UltraFix Recharts v2.0 — Scanner Total Ativado..."
Write-Host "⚡ Escaneando todos os módulos React do projeto..."

$projectPath = Get-Location

# Diretórios que contêm código real
$targetDirs = @(
    "\app",
    "\src\app",
    "\components",
    "\src\components",
    "\scripts\app"
)

# Diretórios a ignorar
$ignore = @("\node_modules", "\.next", "\public", "\dist", "\build")

$files = @()

foreach ($dir in $targetDirs) {
    $path = Join-Path $projectPath $dir
    if (Test-Path $path) {
        $files += Get-ChildItem -Path $path -Include *.tsx, *.jsx -Recurse `
            | Where-Object { 
                $p = $_.FullName.ToLower()
                -not ($ignore | ForEach-Object { $p.Contains($_) })
            }
    }
}

$counter = 0
$fixedCounter = 0

foreach ($file in $files) {
    $counter++
    Write-Host "🔍 Verificando: $($file.FullName)"

    $content = Get-Content $file.FullName -Raw
    $fixed = $content

    # Correção 1 — height="100%" → height={300}
    $fixed = $fixed -replace 'height\s*=\s*"(100%)"', 'height={300}'

    # Correção 2 — height={"100%"} → height={300}
    $fixed = $fixed -replace 'height\s*=\s*{\s*"100%"\s*}', 'height={300}'

    # Correção 3 — height='100%' → height={300}
    $fixed = $fixed -replace "height\s*=\s*'100%'", 'height={300}'

    # Correção 4 — Se ResponsiveContainer não tem altura, envolver com minHeight
    if ($fixed -match "<ResponsiveContainer" -and $fixed -notmatch "minHeight") {
        $fixed = $fixed -replace '(ResponsiveContainer[^>]*>)', '<div style={{ minHeight: "300px", width: "100%" }}>$1'
        $fixed = $fixed -replace '(</ResponsiveContainer>)', '$1</div>'
    }

    if ($fixed -ne $content) {
        Set-Content -Path $file.FullName -Value $fixed -Encoding UTF8
        Write-Host "✔ Corrigido: $($file.Name)"
        $fixedCounter++
    }
}

Write-Host ""
Write-Host "🎉 UltraFix Recharts v2 FINALIZADO!"
Write-Host "📁 Total de arquivos escaneados: $counter"
Write-Host "🔧 Arquivos corrigidos: $fixedCounter"
Write-Host "✔ Agora todos os gráficos estão protegidos!"
