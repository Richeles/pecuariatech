# ======================================================================
# 🔵 UltraFix LAYOUT v1 — Correção Automática de Containers sem Altura
# ======================================================================

Write-Host "🔵 UltraFix-LAYOUT v1 — Scanner de Layout Iniciado..." -ForegroundColor Cyan
Write-Host "⚡ Modo AutoFix Inteligente (min-h detection)..." -ForegroundColor Yellow

# Diretório atual do projeto
$root = Get-Location

# Extensões válidas
$ext = "*.tsx","*.jsx","*.ts","*.js"

# Buscar arquivos ignorando node_modules e builds
$files = Get-ChildItem -Recurse -Include $ext -Path $root | 
    Where-Object { $_.FullName -notmatch "node_modules|\.next|dist|build" }

$total = $files.Count
Write-Host "`n📁 Arquivos válidos encontrados: $total`n"

$fixCount = 0

# Regex de containers problemáticos (sem altura)
$patterns = @(
    '<div([^>]*)(class|className)="([^"]*)"(.*?)>',
    '<section([^>]*)(class|className)="([^"]*)"(.*?)>',
    '<main([^>]*)(class|className)="([^"]*)"(.*?)>',
    '<article([^>]*)(class|className)="([^"]*)"(.*?)>'
)

foreach ($file in $files) {

    $content = Get-Content $file.FullName -Raw
    $original = $content

    $modified = $false

    foreach ($regex in $patterns) {
        $content = [regex]::Replace($content, $regex, {
            param($match)

            $tag = $match.Value

            # Classes atuais
            $classes = $match.Groups[3].Value

            # Se já tem altura definida
            if ($classes -match "min-h|h-|height|screen") {
                return $tag
            }

            # Se for flex, grid ou wrapper sem altura → aplicar fix
            if ($classes -match "flex|grid|container|w-full|wrapper|content|items-center|justify-center") {

                $newClasses = "$classes min-h-[300px]"
                $fixed = $tag -replace [regex]::Escape($classes), $newClasses

                $modified = $true
                return $fixed
            }

            return $tag
        })
    }

    if ($modified) {
        Set-Content $file.FullName $content -Encoding UTF8
        $fixCount++
        Write-Host "🔧 Corrigido: $($file.Name)"
    } else {
        Write-Host "✔ OK: $($file.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "`n🎉 UltraFix-LAYOUT v1 FINALIZADO!"
Write-Host "📁 Arquivos analisados: $total"
Write-Host "🔧 Containers corrigidos: $fixCount"
Write-Host "🚀 Layout agora está protegido contra height(-1) / container colapsado!"
