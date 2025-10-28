Write-Host "🚀 Ultra Build Fix — PecuariaTech Cloud v6.2" -ForegroundColor Cyan

# === 1️⃣ Corrigir rootDir no tsconfig.json ===
$configPath = "tsconfig.json"
if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw -Encoding UTF8
    if ($content -match '"rootDir"\s*:\s*".*?"') {
        $content = $content -replace '"rootDir"\s*:\s*".*?"', '"rootDir": "."'
        Write-Host "✔️ rootDir ajustado para '.'" -ForegroundColor Green
    } else {
        $content = $content -replace '("compilerOptions"\s*:\s*{)', '$1`n    "rootDir": ".",'
        Write-Host "➕ rootDir adicionado em compilerOptions" -ForegroundColor Yellow
    }
    Set-Content -Path $configPath -Value $content -Encoding UTF8
} else {
    Write-Host "⚠️ tsconfig.json não encontrado, ignorando ajuste de rootDir." -ForegroundColor Yellow
}

# === 2️⃣ Corrigir tipo no UltraChat.tsx ===
$chatPath = "app\components\UltraChat.tsx"
if (Test-Path $chatPath) {
    $content = Get-Content $chatPath -Raw -Encoding UTF8

    # Corrigir definição de 'user'
    $pattern = "const user\s*=\s*{ role:\s*'user',\s*text:\s*text\.trim\(\),\s*ts:\s*new Date\(\)\.toISOString\(\)\s*};"
    $replacement = "const user: Msg = { role: 'user', text: text.trim(), ts: new Date().toISOString() };"
    $content = [Regex]::Replace($content, $pattern, $replacement)

    # Corrigir setMessages
    $pattern2 = "setMessages\s*\(\s*m\s*=>"
    $replacement2 = "setMessages((m: Msg[]) =>"
    $content = [Regex]::Replace($content, $pattern2, $replacement2)

    Set-Content -Path $chatPath -Value $content -Encoding UTF8
    Write-Host "🧠 Corrigido tipo de estado em: app/components/UltraChat.tsx" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ app/components/UltraChat.tsx não encontrado." -ForegroundColor Red
}

# === 3️⃣ Limpar cache e dependências ===
Write-Host "🧹 Limpando cache do Next.js..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
npm cache clean --force | Out-Null

Write-Host "📦 Reinstalando dependências..." -ForegroundColor Cyan
npm install --legacy-peer-deps

# === 4️⃣ Compilar ===
Write-Host "⚙️ Executando build..." -ForegroundColor Cyan
npm run build
