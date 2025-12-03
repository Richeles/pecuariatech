Write-Host "🧩 Forçando regravação limpa (UTF-8 sem BOM)..." -ForegroundColor Cyan

$targetFiles = @(
  "app\api\autonomo\route.ts",
  "app\api\chat\route.ts",
  "app\components\UltraChat.tsx",
  "app\dashboard\page.tsx",
  "app\layout.tsx"
)

foreach ($file in $targetFiles) {
  $path = Join-Path (Get-Location) $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    # Remove manual e invisivelmente quaisquer caracteres BOM ou lixo
    $clean = $content -replace "^[\uFEFF\u200B\uFFFD]+", ""
    Set-Content -Path $path -Value $clean -Encoding UTF8
    Write-Host "✔️ Regravado limpo: $file" -ForegroundColor Green
  } else {
    Write-Host "⚠️ Arquivo não encontrado: $file" -ForegroundColor Yellow
  }
}

Write-Host "`n✅ Regravação completa. Agora execute: npm run build" -ForegroundColor Green
