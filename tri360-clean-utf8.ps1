Write-Host "🧩 Tri360 Clean UTF-8 — Reparo definitivo de codificação e build" -ForegroundColor Cyan

$raiz = "C:\Users\Administrador\pecuariatech"
$backup = "$raiz\_backup_utf8_$(Get-Date -Format yyyyMMdd_HHmmss)"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

Write-Host "📦 Backup de segurança criado em: $backup" -ForegroundColor Yellow

# Selecionar todos os arquivos relevantes
$arquivos = Get-ChildItem -Path $raiz -Recurse -Include *.ts,*.tsx,*.js,*.json,*.html,*.css,*.md,*.env,*.txt -ErrorAction SilentlyContinue

foreach ($arquivo in $arquivos) {
    try {
        $conteudo = Get-Content -Raw -Path $arquivo.FullName -ErrorAction Stop
        Copy-Item $arquivo.FullName -Destination $backup -Force
        [System.IO.File]::WriteAllText($arquivo.FullName, $conteudo, (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "✅ Corrigido UTF-8: $($arquivo.FullName)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Falha ao processar: $($arquivo.FullName)" -ForegroundColor Yellow
    }
}

# Limpa caches e builds antigos
Write-Host "🧹 Limpando build e cache antigos..." -ForegroundColor Cyan
Remove-Item "$raiz\.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$raiz\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$raiz\out" -Recurse -Force -ErrorAction SilentlyContinue

# Reinstalar dependências e rebuild
Write-Host "📦 Reinstalando dependências..." -ForegroundColor Yellow
npm install --force

Write-Host "🏗️ Recriando build limpo..." -ForegroundColor Yellow
npm run build

Write-Host "🌐 Pronto para redeploy na Vercel!" -ForegroundColor Green
Write-Host "💡 Use o comando abaixo para enviar o site limpo:" -ForegroundColor Cyan
Write-Host "vercel --prod" -ForegroundColor Green
