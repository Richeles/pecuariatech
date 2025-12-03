Write-Host "🚨 UltraFix — Corrigindo erro em scripts/ts/hello.ts" -ForegroundColor Cyan

$hello = "scripts/ts/hello.ts"

if (Test-Path $hello) {
    Write-Host "🗑 Removendo hello.ts (não deve ser compilado pelo Next)..."
    Remove-Item $hello -Force
    Write-Host "✔ hello.ts removido!"
} else {
    Write-Host "✔ Nenhum arquivo hello.ts encontrado."
}

# Garantir que scripts não participem do build
$tsconfig = "tsconfig.json"

if (Test-Path $tsconfig) {
    Write-Host "🔧 Ajustando tsconfig.json para ignorar /scripts..."
    
    $json = Get-Content $tsconfig -Raw | ConvertFrom-Json
    
    if (-not $json.exclude) {
        $json | Add-Member -MemberType NoteProperty -Name "exclude" -Value @("scripts")
    } elseif ($json.exclude -notcontains "scripts") {
        $json.exclude += "scripts"
    }
    
    $json | ConvertTo-Json -Depth 10 | Set-Content $tsconfig
    Write-Host "✔ tsconfig atualizado para excluir scripts/"
}

# Limpar cache Next.js
Write-Host "🧹 Limpando cache..."
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }

# Build
Write-Host "📦 Rodando build final..."
npm run build
