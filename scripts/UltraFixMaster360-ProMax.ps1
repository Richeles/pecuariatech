Write-Host "🔧 UltraFix MASTER 360 PRO MAX — Iniciando..." -ForegroundColor Cyan

Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue

npm install

npm cache verify

npm run build

Write-Host "✅ UltraFix concluído com sucesso!" -ForegroundColor Green
