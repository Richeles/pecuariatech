Write-Host "🧠 Corrigindo rootDir do TypeScript..." -ForegroundColor Cyan

$configPath = "tsconfig.json"

if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw -Encoding UTF8

    # Substitui o rootDir atual por "."
    if ($content -match '"rootDir"\s*:\s*".*?"') {
        $content = $content -replace '"rootDir"\s*:\s*".*?"', '"rootDir": "."'
        Write-Host "✔️ rootDir ajustado para '.'" -ForegroundColor Green
    } else {
        # Se não existir, insere dentro de compilerOptions
        $content = $content -replace '("compilerOptions"\s*:\s*{)', '$1`n    "rootDir": ".",'
        Write-Host "➕ rootDir adicionado em compilerOptions" -ForegroundColor Yellow
    }

    # Regrava o arquivo
    Set-Content -Path $configPath -Value $content -Encoding UTF8
    Write-Host "💾 tsconfig.json atualizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ tsconfig.json não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "🧹 Limpando cache do Next.js..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue

Write-Host "📦 Reinstalando dependências..." -ForegroundColor Cyan
npm install --legacy-peer-deps

Write-Host "⚙️ Tentando novo build..." -ForegroundColor Cyan
npm run build
