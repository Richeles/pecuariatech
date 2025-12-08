Write-Host "🔍 UltraFix Guardião — Validando projeto..." -ForegroundColor Yellow

# 1) Verificar se a pasta app existe
if (-Not (Test-Path "app")) {
  Write-Host "❌ Pasta app faltando!" -ForegroundColor Red
} else {
  Write-Host "✔ Pasta app encontrada." -ForegroundColor Green
}

# 2) Detectar possíveis imports quebrados (simples)
Get-ChildItem -Recurse -Filter *.tsx | ForEach-Object {
  $file = $_.FullName
  $content = Get-Content $file -Raw

  if ($content -match "from ''") {
    Write-Host "⚠ Import suspeito em: $file" -ForegroundColor Yellow
  }
}

# 3) Checar 'use client' fora da primeira linha
Get-ChildItem -Recurse -Filter *.tsx | ForEach-Object {
  $file = $_.FullName
  $lines = Get-Content $file

  if ($lines -match "use client") {
    if ($lines[0] -notmatch "use client") {
      Write-Host "⚠ 'use client' fora do topo em: $file" -ForegroundColor Red
    }
  }
}

Write-Host "✔ Guardião finalizado!" -ForegroundColor Green
