Write-Host "🔧 Iniciando correção de limite de tamanho para Vercel..." -ForegroundColor Cyan

# PASTAS QUE NÃO DEVEM IR PARA O DEPLOY
$ignoreList = @(
    ".next",
    ".vercel",
    "node_modules",
    "logs",
    "backup",
    "uploads_raw",
    "temp",
    "dist",
    "out",
    "coverage"
)

# Criar ou atualizar .vercelignore
$ignoreFile = ".vercelignore"

Write-Host "📄 Criando/atualizando arquivo .vercelignore..." -ForegroundColor Cyan
$ignoreList | Out-File -FilePath $ignoreFile -Encoding UTF8

Write-Host "🧹 Limpando pastas pesadas..." -ForegroundColor Yellow

foreach ($folder in $ignoreList) {
    if (Test-Path $folder) {
        try {
            Remove-Item -Recurse -Force $folder
            Write-Host "   ✔ Removido: $folder"
        }
        catch {
            Write-Host "   ⚠ Não foi possível remover: $folder"
        }
    }
}

Write-Host "🧪 Verificando arquivos maiores que 20MB..." -ForegroundColor Yellow
Get-ChildItem -Recurse | Where-Object { $_.Length -gt 20MB } | ForEach-Object {
    Write-Host "   ⚠ Arquivo grande detectado:" $_.FullName
}

Write-Host "🚀 Tentando deploy novamente..." -ForegroundColor Green
vercel --prod
