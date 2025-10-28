Write-Host "🚀 Iniciando limpeza binária de BOM (forçada)..." -ForegroundColor Cyan

# Lista dos arquivos críticos
$files = @(
  "app\api\autonomo\route.ts",
  "app\api\chat\route.ts",
  "app\components\UltraChat.tsx",
  "app\dashboard\page.tsx",
  "app\layout.tsx"
)

# Percorre cada arquivo e remove bytes EF BB BF
foreach ($f in $files) {
  $path = Join-Path (Get-Location) $f
  if (Test-Path $path) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    if ($bytes.Length -gt 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
      $clean = $bytes[3..($bytes.Length - 1)]
      [System.IO.File]::WriteAllBytes($path, $clean)
      Write-Host "✔️ BOM removido: $f" -ForegroundColor Green
    } else {
      Write-Host "ℹ️ Nenhum BOM encontrado: $f" -ForegroundColor Yellow
    }
  } else {
    Write-Host "⚠️ Arquivo não encontrado: $f" -ForegroundColor Red
  }
}

Write-Host "`n✅ Limpeza binária concluída com sucesso!" -ForegroundColor Green
