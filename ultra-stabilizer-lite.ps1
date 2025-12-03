Write-Host "🌎 Ultra Stabilizer — PecuariaTech Cloud v2 (Fast Mode)`n"

$projectRoot = "C:\Users\Administrador\pecuariatech"

Write-Host "🧩 Verificando arquivos UTF-8 apenas em código fonte..."

# Filtra apenas pastas principais do projeto
$files = Get-ChildItem -Path $projectRoot -Recurse -Include *.ts, *.tsx, *.js, *.jsx, *.json, *.ps1 `
    -Exclude node_modules, .next, .git, logs, dist, build, .vercel `
    -ErrorAction SilentlyContinue

$total = $files.Count
$i = 0

foreach ($file in $files) {
    $i++
    Write-Progress -Activity "Verificando arquivos UTF-8..." -Status "$i / $total" -PercentComplete (($i / $total) * 100)

    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        # remove caracteres corrompidos comuns
        $content = $content -replace 'ÃƒÂ', 'ã' -replace 'Ã¢â‚¬', '-' -replace 'Â', '' -replace 'Ã§', 'ç' -replace 'Ã³', 'ó' -replace 'Ã­', 'í' -replace 'Ã©', 'é' -replace 'Ã¡', 'á'
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    } catch {
        Write-Host "⚠️ Erro ao processar $($file.Name)"
    }
}

Write-Host "✅ Varredura concluída com sucesso!"
Write-Host "🚀 Executando build otimizado..."
npm run build
