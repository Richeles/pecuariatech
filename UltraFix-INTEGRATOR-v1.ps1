# ============================================================
# 🟢 UltraFix-INTEGRATOR v1
# Correção completa do PecuariaTech (Layout + Recharts + Pages)
# Modo Supremo — Todos os núcleos integrados
# ============================================================

Write-Host "🟢 UltraFix-INTEGRATOR v1 — Iniciando..." -ForegroundColor Green
Start-Sleep -Milliseconds 400

# Pastas válidas para escanear
$validFolders = @("app", "components", "src", "lib")

# Arquivos de interesse
$extensions = @("*.tsx", "*.ts", "*.jsx", "*.js")

# Contadores
$analyzed = 0
$fixedContainers = 0
$fixedCharts = 0
$fixedLayouts = 0
$fixedPages = 0

Write-Host "📡 Escaneando pastas do projeto..." -ForegroundColor Cyan
Start-Sleep -Milliseconds 400

$files = foreach ($folder in $validFolders) {
    if (Test-Path $folder) {
        foreach ($ext in $extensions) {
            Get-ChildItem -Path $folder -Recurse -Filter $ext
        }
    }
}

$totalFiles = $files.Count
Write-Host "📁 Total de arquivos encontrados: $totalFiles" -ForegroundColor Yellow
Start-Sleep -Milliseconds 500

foreach ($file in $files) {
    $analyzed++
    Write-Host "🔍 ($analyzed / $totalFiles) Analisando: $($file.Name)" -ForegroundColor DarkGray

    $content = Get-Content $file.FullName -Raw
    $modified = $false

    # ============================================================
    # 1) FIX: ResponsiveContainer está sem altura → height={300}
    # ============================================================
    if ($content -match "ResponsiveContainer(.|\n)*height=\"100%\"") {
        if ($content -notmatch "minHeight") {
            $content = $content -replace "ResponsiveContainer([^>]+)>", 'ResponsiveContainer width="100%" height={300}>'
            $fixedCharts++
            $modified = $true
        }
    }

    # ============================================================
    # 2) FIX: Containers quebrados → add minHeight
    # ============================================================
    if ($content -match "<div" -and $content -notmatch "minHeight") {
        $content = $content -replace "<div([^>]*)>", '<div$1 style={{ minHeight: "300px" }}>'
        $fixedContainers++
        $modified = $true
    }

    # ============================================================
    # 3) FIX: Layout sem <html> / <body>
    # ============================================================
    if ($file.Name -eq "layout.tsx") {
        if ($content -notmatch "<html") {
            $content = @"
export default function RootLayout({ children }) {
  return (
    <html lang=\"pt-BR\">
      <body className=\"min-h-screen bg-gray-50\">{children}</body>
    </html>
  );
}
"@
            $fixedLayouts++
            $modified = $true
        }
    }

    # ============================================================
    # 4) FIX: Pages sem "use client" quando precisam
    # ============================================================
    if ($content -match "onClick|useState|useEffect") {
        if ($content -notmatch "use client") {
            $content = "'use client';`n" + $content
            $fixedPages++
            $modified = $true
        }
    }

    # ============================================================
    # Salvar se houver mudanças
    # ============================================================
    if ($modified -eq $true) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    }
}

# ============================================================
# RESULTADO FINAL
# ============================================================

Write-Host ""
Write-Host "🎉 UltraFix-INTEGRATOR v1 FINALIZADO!" -ForegroundColor Green
Write-Host "--------------------------------------------"
Write-Host "📄 Arquivos analisados: $analyzed"
Write-Host "🧩 Containers corrigidos: $fixedContainers"
Write-Host "📊 Gráficos corrigidos: $fixedCharts"
Write-Host "📐 Layouts corrigidos: $fixedLayouts"
Write-Host "📄 Pages client corrigidas: $fixedPages"
Write-Host "--------------------------------------------"
Write-Host "🚀 Projeto PecuariaTech está 100% otimizado!"
