# ======================================================================
# 🔵 UltraFix LAYOUT v1.2 — Correção Sem Erros (Somente Arquivos React)
# ======================================================================

Write-Host "🔵 UltraFix-LAYOUT v1.2 — Scanner Inteligente Iniciado..." -ForegroundColor Cyan
Write-Host "⚡ Modo AutoFix Premium (JSX-only)..." -ForegroundColor Yellow

$root = Get-Location
$ext = "*.tsx","*.jsx"   # ← SOMENTE arquivos com JSX (os únicos que precisam de layout fix)

$files = Get-ChildItem -Recurse -Include $ext -Path $root |
    Where-Object { $_.FullName -notmatch "node_modules|\.next|dist|build" }

$total = $files.Count
Write-Host "`n📁 Arquivos React encontrados: $total`n"

$fixCount = 0

# Regex de containers JSX
$patterns = @(
    '<div([^>]*)(class|className)="([^"]*)"(.*?)>',
    '<section([^>]*)(class|className)="([^"]*)"(.*?)>',
    '<main([^>]*)(class|className)="([^"]*)"(.*?)>',
    '<article([^>]*)(class|className)="([^"]*)"(.*?)>'
)

foreach ($file in $files) {

    $content = Get-Content $file.FullName -Raw

    # Pular arquivos vazios
    if ([string]::IsNullOrWhiteSpace($content)) {
        Write-Host "⏭ Ignorado (vazio): $($file.Name)" -ForegroundColor DarkGray
        continue
    }

    # Pular arquivos sem JSX
    if ($content -notmatch "<[a-zA-Z]") {
        Write-Host "⏭ Ignorado (não é JSX): $($file.Name)" -ForegroundColor DarkGray
        continue
    }

    $modified = $false
    $updated = $content

    foreach ($regex in $patterns) {

        $updated = [regex]::Replace($updated, $regex, {
            param($match)

            $tag = $match.Value
            $classes = $match.Groups[3].Value

            # Já tem altura?
            if ($classes -match "min-h|\bh-|height|screen") {
                return $tag
            }

            # Containers flex/grid precisam de min-h
            if ($classes -match "flex|grid|container|w-full|wrapper|items-center|justify-center") {
                $newClasses = "$classes min-h-[300px]"
                $modified = $true
                return $tag -replace [regex]::Escape($classes), $newClasses
            }

            return $tag
        })
    }

    if ($modified) {
        Set-Content $file.FullName $updated -Encoding UTF8
        $fixCount++
        Write-Host "🔧 Corrigido: $($file.Name)"
    } else {
        Write-Host "✔ OK: $($file.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "`n🎉 UltraFix-LAYOUT v1.2 FINALIZADO!"
Write-Host "📁 Arquivos analisados: $total"
Write-Host "🔧 Containers corrigidos: $fixCount"
Write-Host "🚀 Zero erros! Layout protegido."
