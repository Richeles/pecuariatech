# pipeline.ps1 - Orquestrador ultrabiológico do PecuariaTech
# ---------------------------------------------------------

Write-Host "🚀 Iniciando Pipeline PecuariaTech..." -ForegroundColor Cyan

# Garantir que estamos na raiz do projeto
Set-Location "C:\Users\Administrador\pecuariatech"

# 1. Carregar variáveis do .env
$envFile = ".\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*#") { return } # Ignora comentários
        if ($_ -match "^\s*$") { return } # Ignora linhas em branco
        $parts = $_ -split "=", 2
        if ($parts.Count -eq 2) {
            [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim())
        }
    }
    Write-Host "✅ Variáveis de ambiente carregadas." -ForegroundColor Green
} else {
    Write-Host "⚠ Arquivo .env não encontrado. Continuando sem variáveis." -ForegroundColor Yellow
}

# 2. Verificar dependências (Node + npm)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale antes de rodar o pipeline." -ForegroundColor Red
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm não encontrado. Instale antes de rodar o pipeline." -ForegroundColor Red
    exit 1
}

# 3. Executar ultrabiologico.ts com ts-node
Write-Host "🔄 Executando módulo ultrabiológico..." -ForegroundColor Cyan
npx ts-node .\scripts\ultrabiologico.ts

# 4. Resultado final
if ($LASTEXITCODE -eq 0) {
    Write-Host "🏁 Pipeline finalizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "🚨 Pipeline encontrou erros. Veja os logs acima." -ForegroundColor Red
}
