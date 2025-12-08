Write-Host "🧽 UltraFix π 2/3 — Purificando ambiente..." -ForegroundColor Yellow

$root = "C:\Users\Administrador\pecuariatech"
Set-Location $root

Remove-Item -Recurse -Force "$root\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\node_modules" -ErrorAction SilentlyContinue

npm install

Write-Host "✔ Ambiente purificado — continue com o ciclo 3" -ForegroundColor Cyan
