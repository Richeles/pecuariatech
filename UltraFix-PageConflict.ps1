Write-Host "🔍 UltraFix — Procurando conflitos de 'Page'..." -ForegroundColor Cyan

# 1. Procura todos os arquivos que têm "function Page("
$matches = Get-ChildItem -Recurse -Filter "*.tsx" | Select-String -Pattern "function Page" | Select Path, LineNumber

if ($matches.Count -eq 0) {
    Write-Host "✅ Nenhum outro arquivo com 'function Page' encontrado!"
} else {
    Write-Host "⚠️ ARQUIVOS QUE DECLARAM 'function Page':"
    $matches | ForEach-Object { Write-Host " - $($_.Path)" }
}

# 2. Corrigir arquivo triangulo360
$triangulo = "app/triangulo360/page.tsx"
if (Test-Path $triangulo) {
    Write-Host "🔧 Corrigindo $triangulo ..."
    (Get-Content $triangulo) `
        | ForEach-Object {
            $_ -replace "function Page", "function TrianguloPage"
        } `
        | Set-Content $triangulo
    Write-Host "✅ Triangulo360 corrigido!"
}

# 3. Corrigir automaticamente os outros arquivos conflitantes
foreach ($m in $matches) {
    $file = $m.Path.Replace("\", "/")

    if ($file -ne $triangulo) {
        Write-Host "🛠 Ajustando arquivo: $file"
        (Get-Content $file) `
            | ForEach-Object {
                $_ -replace "function Page", "function PageAutoFix"
            } `
            | Set-Content $file
        Write-Host "   ✔ Renomeado para PageAutoFix"
    }
}

# 4. Limpar cache
Write-Host "🧹 Limpando cache .next ..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

# 5. Rodar build
Write-Host "📦 Rodando build final..."
npm run build
