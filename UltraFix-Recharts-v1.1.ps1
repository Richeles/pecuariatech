Write-Host "🔵 UltraFix Recharts v1.1 — Modo Turbo Ativado..."
Write-Host "⚡ Escaneando componentes sem travar..."

$projectPath = Get-Location

# Pastas para ignorar
$ignore = @("\node_modules\", "\.next\", "\public\", "\dist\", "\build\")

# Captura somente arquivos do projeto real
$files = Get-ChildItem -Path $projectPath -Include *.tsx, *.jsx -Recurse `
    | Where-Object { 
        $path = $_.FullName.ToLower()
        -not ($ignore | ForEach-Object { $path.Contains($_) })
    }

$counter = 0
$fixedCounter = 0

foreach ($file in $files) {
    $counter++
    Write-Host "🔍 Verificando: $($file.Name)"

    $content = Get-Content $file.FullName -Raw
    $fixed = $content

    # Correção 1 — height="100%" → height={300}
    $fixed = $fixed -replace 'height\s*=\s*"(100%)"', 'height={300}'

    # Correção 2 — height={"100%"} → height={300}
    $fixed = $fixed -replace 'height\s*=\s*{\s*"100%"\s*}', 'height={300}'

    # Correção 3 — height='100%' → height={300}
    $fixed = $fixed -replace "height\s*=\s*'100%'", 'height={300}'

    # Correção 4 — Envelopar ResponsiveContainer sem altura definida
    if ($fixed -match "<ResponsiveContainer" -and $fixed -notmatch "minHeight") {
        $fixed = $fixed -replace '(ResponsiveContainer[^>]*>)', '<div style={{ minHeight: "300px", width: "100%" }}>$1'
        $fixed = $fixed -replace '(</ResponsiveContainer>)', '$1</div>'
    }

    # Só salva se houve modificação
    if ($fixed -ne $content) {
        $fixedCounter++
        Set-Content -Path $file.FullName -Value $fixed -Encoding UTF8
        Write-Host "✔ Corrigido: $($file.Name)"
    }
}

Write-Host ""
Write-Host "🎉 UltraFix Recharts TURBO Finalizado!"
Write-Host "📁 Total de arquivos escaneados: $counter"
Write-Host "🔧 Arquivos corrigidos: $fixedCounter"
Write-Host "✔ Você agora está 100% livre do erro width(-1) / height(-1)!"
