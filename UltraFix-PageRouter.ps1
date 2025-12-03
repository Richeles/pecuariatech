Write-Host "🚨 UltraFix — Corrigindo conflito global de páginas..." -ForegroundColor Cyan

# 1. Remover página ilegal na raiz
$rootPage = "page.tsx"

if (Test-Path $rootPage) {
    Write-Host "🗑 Removendo page.tsx da raiz (erro crítico)..."
    Remove-Item $rootPage -Force
    Write-Host "✔ page.tsx removido!"
} else {
    Write-Host "✔ Nenhuma page.tsx na raiz."
}

# 2. Restaurar Triangulo360 corretamente
$triangulo = "app/triangulo360/page.tsx"
if (Test-Path $triangulo) {
    Write-Host "🔧 Restaurando Triangulo360/page.tsx..."
    (Get-Content $triangulo) `
        | ForEach-Object {
            $_ -replace "PageAutoFix", "Page"
        } `
        | Set-Content $triangulo
    Write-Host "✔ Triangulo360 restaurado!"
}

# 3. Verificar outros arquivos afetados
Write-Host "🔍 Limpando inconsistências em outras rotas..."

$targets = @(
    "app/teste/page.tsx",
    "app/ultrabiologica/status/page.tsx"
)

foreach ($file in $targets) {
    if (Test-Path $file) {
        Write-Host "🛠 Revisando $file..."
        (Get-Content $file) `
            | ForEach-Object {
                $_ -replace "PageAutoFix", "Page"
            } `
            | Set-Content $file
        Write-Host "✔ Restaurado"
    }
}

# 4. Limpar .next
Write-Host "🧹 Limpando cache..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

# 5. Rodar build
Write-Host "📦 Rodando build final..."
npm run build
