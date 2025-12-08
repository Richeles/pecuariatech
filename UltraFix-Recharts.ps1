Write-Host "🔵 UltraFix Recharts v1 — Correção Automática de width(-1) e height(-1)..."

$projectPath = Get-Location
$files = Get-ChildItem -Path $projectPath -Include *.tsx, *.jsx -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Correção 1: ResponsiveContainer height='100%' → height={300}
    $fixed = $content -replace 'ResponsiveContainer([^>]+)height\s*=\s*"(100%)"', 'ResponsiveContainer`$1height={300}'

    # Correção 2: ResponsiveContainer height={'100%'} → height={300}
    $fixed = $fixed -replace 'ResponsiveContainer([^>]+)height\s*=\s*{\s*"100%"\s*}', 'ResponsiveContainer`$1height={300}'

    # Correção 3: Adicionar minHeight automaticamente no container
    # Envelopa qualquer <ResponsiveContainer> sem container pai adequado
    if ($fixed -notmatch 'minHeight') {
        $fixed = $fixed -replace '(ResponsiveContainer[^>]+>)', '<div style={{ minHeight: "300px", width: "100%" }}>$1'
        $fixed = $fixed -replace '(</ResponsiveContainer>)', '$1</div>'
    }

    # Se houve alguma mudança, salva o arquivo
    if ($content -ne $fixed) {
        Set-Content -Path $file.FullName -Value $fixed -Encoding UTF8
        Write-Host "✔ Corrigido: $($file.FullName)"
    }
}

Write-Host "🎉 UltraFix Recharts Finalizado — Todos os gráficos protegidos!"
