Write-Host "🧩 Corrigindo tipagem de children em layout.tsx..." -ForegroundColor Cyan

$layoutPath = "app\layout.tsx"

if (Test-Path $layoutPath) {
    $content = Get-Content $layoutPath -Raw -Encoding UTF8

    # Adicionar import React caso não exista
    if ($content -notmatch "import\s+React") {
        $content = "import React from 'react';`n" + $content
        Write-Host "➕ Adicionado import React" -ForegroundColor Yellow
    }

    # Corrigir função RootLayout com tipagem explícita
    $pattern = "export\s+default\s+function\s+RootLayout\s*\(\s*{[^}]*}\s*\)"
    $replacement = "export default function RootLayout({ children }: { children: React.ReactNode })"
    $content = [Regex]::Replace($content, $pattern, $replacement)

    Set-Content -Path $layoutPath -Value $content -Encoding UTF8
    Write-Host "✔️ Tipagem corrigida com sucesso em layout.tsx" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo layout.tsx não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "🧹 Limpando cache do Next.js..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue

Write-Host "⚙️ Compilando projeto..." -ForegroundColor Cyan
npm run build
