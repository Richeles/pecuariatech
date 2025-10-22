# =====================================================================
# 🌾 PECUARIATECH - CORREÇÃO DEFINITIVA DE CODIFICAÇÃO UTF-8
# =====================================================================
Write-Host "[INFO] Iniciando correção UTF-8 real..." -ForegroundColor Cyan
Set-Location "C:\Users\Administrador\pecuariatech"

# 1️⃣ Limpa build anterior
Write-Host "[1] Limpando cache antigo..." -ForegroundColor Yellow
Remove-Item -Recurse -Force ".next","out","vercel" -ErrorAction SilentlyContinue

# 2️⃣ Força todos os arquivos TSX, JS e HTML para UTF-8 sem BOM
Write-Host "[2] Reconvertendo arquivos para UTF-8..." -ForegroundColor Yellow
$arquivos = Get-ChildItem -Path . -Include *.tsx,*.ts,*.js,*.jsx,*.html,*.css -Recurse |
            Where-Object { -not ($_.FullName -match "node_modules|.next|out|logs") }

foreach ($arquivo in $arquivos) {
    try {
        $path = $arquivo.FullName
        $conteudo = Get-Content -Raw -Encoding Default -Path $path
        [System.IO.File]::WriteAllText($path, $conteudo, (New-Object System.Text.UTF8Encoding($false)))
    } catch {
        Write-Host "Erro em: $path" -ForegroundColor Red
    }
}

# 3️⃣ Revalida o meta charset no layout global
Write-Host "[3] Garantindo meta charset UTF-8..." -ForegroundColor Yellow
$layout = Get-ChildItem -Path . -Recurse -Include layout.tsx | Select-Object -First 1
if ($layout) {
    (Get-Content $layout.FullName -Raw) -replace '<head>', "<head>`n<meta charSet='utf-8' />" |
        Set-Content -Encoding utf8 -Path $layout.FullName
    Write-Host "Meta UTF-8 aplicado em: $($layout.FullName)" -ForegroundColor Green
}

# 4️⃣ Build limpo
Write-Host "[4] Gerando build limpo..." -ForegroundColor Yellow
npm run build

# 5️⃣ Deploy
Write-Host "[5] Publicando build corrigido..." -ForegroundColor Yellow
vercel --prod --confirm

# 6️⃣ Atualizar domínio principal
Write-Host "[6] Atualizando domínio www.pecuariatech.com..." -ForegroundColor Yellow
vercel alias set https://pecuariatech.vercel.app www.pecuariatech.com --scope richeles-alves-dos-santos-projects

Write-Host "✅ Correção UTF-8 concluída!" -ForegroundColor Green
Write-Host "🌎 Verifique: https://www.pecuariatech.com/dashboard"
