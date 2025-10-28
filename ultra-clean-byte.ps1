Write-Host "🧹 Ultra Clean Byte — Removendo cabeçalhos invisíveis (EF BB BF)..." -ForegroundColor Cyan

$arquivos = @(
  "app\api\autonomo\route.ts",
  "app\api\chat\route.ts",
  "app\components\UltraChat.tsx",
  "app\dashboard\page.tsx",
  "app\layout.tsx"
)

foreach ($arquivo in $arquivos) {
  $caminho = Join-Path (Get-Location) $arquivo
  if (Test-Path $caminho) {
    $bytes = [System.IO.File]::ReadAllBytes($caminho)
    if ($bytes.Length -gt 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
      $bytes = $bytes[3..($bytes.Length - 1)]
      [System.IO.File]::WriteAllBytes($caminho, $bytes)
      Write-Host "✔️ EF BB BF removido do início de $arquivo" -ForegroundColor Green
    } else {
      # Remove caracteres literais invisíveis (ï»¿ gravado no texto)
      $texto = Get-Content $caminho -Raw -Encoding UTF8
      $textoLimpo = $texto -replace "^(ï»¿|﻿)+", ""
      Set-Content $caminho -Value $textoLimpo -Encoding UTF8
      Write-Host "🔹 Limpado texto invisível em $arquivo" -ForegroundColor Yellow
    }
  } else {
    Write-Host "⚠️ Arquivo não encontrado: $arquivo" -ForegroundColor Red
  }
}

Write-Host "`n✅ Limpeza ultra-byte concluída. Agora rode: npm run build" -ForegroundColor Green
