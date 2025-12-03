Write-Host "🚀 Ultra Clean v2 — Removendo lixo UTF-8 e corrigindo diretivas 'use client'..." -ForegroundColor Cyan

$arquivos = @(
  "app\api\autonomo\route.ts",
  "app\api\chat\route.ts",
  "app\components\UltraChat.tsx",
  "app\dashboard\page.tsx",
  "app\layout.tsx",
  "app\pastagem\page.tsx",
  "app\rebanho\page.tsx",
  "app\ultrabiologica\status\page.tsx"
)

foreach ($arquivo in $arquivos) {
  $caminho = Join-Path (Get-Location) $arquivo
  if (Test-Path $caminho) {
    $texto = Get-Content $caminho -Raw -Encoding UTF8

    # Remove caracteres invisíveis (BOM, , )
    $texto = $texto -replace "^(|)+", ""

    # Move 'use client' para o topo se estiver fora do lugar
    if ($texto -match "(?ms)^<meta.*?>\s*'use client';") {
      $texto = $texto -replace "(?ms)^<meta.*?>\s*'use client';", "'use client';`r`n<meta charSet='UTF-8' />"
      Write-Host "🧠 Corrigida diretiva 'use client' em: $arquivo" -ForegroundColor Yellow
    }

    # Salva regravando em UTF-8 puro
    Set-Content -Path $caminho -Value $texto -Encoding UTF8
    Write-Host "✔️ Arquivo limpo: $arquivo" -ForegroundColor Green
  } else {
    Write-Host "⚠️ Arquivo não encontrado: $arquivo" -ForegroundColor Red
  }
}

Write-Host "`n✅ Limpeza e correção concluídas. Agora execute: npm run build" -ForegroundColor Green
