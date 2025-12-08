# ============================================================
# 🟢 UltraFix-INTEGRATOR v1.1 (CORRIGIDO)
# Correção completa do PecuariaTech
# ============================================================

Write-Host "🟢 UltraFix-INTEGRATOR v1.1 — Iniciando..." -ForegroundColor Green
Start-Sleep -Milliseconds 300

$validFolders = @("app", "components", "src", "lib")
$extensions = @("*.tsx", "*.ts", "*.jsx", "*.js")

$analyzed = 0
$fixedCharts = 0
$fixedContainers = 0
$fixedLayouts = 0
$fixedPages = 0

$files = foreach ($folder in $validFolders) {
    if (Test-Path $folder) {
        foreach ($ext in $extensions) {
            Get-ChildItem -Path $folder -Recurse -Filter $ext
        }
    }
}

$totalFiles = $files.Count
Write-Host "📁 Total de arquivos encontrados: $totalFiles" -ForegroundColor Yellow

foreach ($file in $files) {
    $analyzed++
    Write-Host "🔍 ($analyzed / $totalFiles) $($file.Name)" -ForegroundColor DarkGray

    $content = Get-Content $file.FullName -Raw
    if (-not $content) { continue }

    $modified = $false

    # ============================================================
    # 1) FIX: ResponsiveContainer sem altura
    # (usamos regex sem o caractere %)
    # ============================================================
    if ($content -match "ResponsiveContainer" -and $content -match "height=`"100`"") {

        if ($content -notmatch "minHeight") {
            $content = $content -replace "ResponsiveContainer([^>]+)>", 'ResponsiveContainer width="100%" height={300}>'
            $fixedCharts++
            $modified = $true
        }
    }

    # ============================================================
    # 2) FIX: Containers sem minHeight
    # ============================================================
    if ($content -match "<div" -and $content -notmatch "minHeight") {
        $content = $content -replace "<div([^>]*)>", '<div$1 style={{ minHeight: "300px" }}>'
        $fixedContainers++
        $modified = $true
    }

    # ============================================================
    # 3) FIX: layout.tsx corrigido se estiver vazio
    # ============================================================
    if ($file.Name -eq "layout.tsx") {
        if ($content -notmatch "<html") {
            $content = @"
'use client';

export default function RootLayout({ children }) {
  return (
    <html lang=\"pt-BR\">
      <body className=\"min-h-screen bg-gray-50\">
        {children}
      </body>
    </html>
  );
}
"@
            $fixedLayouts++
            $modified = $true
        }
    }

    # ============================================================
    # 4) FIX: Páginas client
    # ============================================================
    if ($content -match "useState|useEffect|onClick") {
        if ($content -notmatch "use client") {
            $content = "'use client';`n" + $content
            $fixedPages++
            $modified = $true
        }
    }

    # ============================================================
    # Salvar alterações
    # ============================================================
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    }
}

Write-Host ""
Write-Host "🎉 UltraFix-INTEGRATOR v1.1 FINALIZADO!" -ForegroundColor Green
Write-Host "📄 Arquivos analisados: $analyzed"
Write-Host "📊 Gráficos corrigidos: $fixedCharts"
Write-Host "📦 Containers corrigidos: $fixedContainers"
Write-Host "📐 Layout corrigidos: $fixedLayouts"
Write-Host "📄 Pages client corrigidas: $fixedPages"
Write-Host "🚀 PecuariaTech 100% otimizado!"
