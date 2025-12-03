# =========================================================
# Script: corrigir-ultra-stabilizer.ps1
# Objetivo: Corrigir erros de aspas e estrutura no script ultra-stabilizer-v4.ps1
# Autor: Richeles (ajuste automático GPT-5)
# =========================================================

Write-Host "🚀 Iniciando correção do script ultra-stabilizer-v4.ps1..." -ForegroundColor Cyan

# Caminho do arquivo original
$arquivo = "C:\Users\Administrador\pecuariatech\ultra-stabilizer-v4.ps1"

# Verifica se o arquivo existe
if (-Not (Test-Path $arquivo)) {
    Write-Host "❌ Arquivo não encontrado: $arquivo" -ForegroundColor Red
    exit
}

# Lê o conteúdo original
$conteudo = Get-Content $arquivo -Raw

# Faz backup automático
$backup = "$arquivo.bak"
Copy-Item $arquivo $backup -Force
Write-Host "📦 Backup criado em: $backup" -ForegroundColor Yellow

# Corrige padrões comuns de erro de aspas
$conteudo = $conteudo -replace "'\\\"type\\\"'", '"type"'
$conteudo = $conteudo -replace "'\"type\"'", '"type"'
$conteudo = $conteudo -replace 'if\s*\(\$text\s*-notmatch\s*\'\"type\"\'\)', 'if ($text -notmatch "\"type\"")'

# Corrige fechamento de blocos ausentes
if ($conteudo -notmatch '\}') {
    Write-Host "🛠 Corrigindo chaves de fechamento..." -ForegroundColor Yellow
    $conteudo += "`n}"
}

# Salva o arquivo corrigido
Set-Content -Path $arquivo -Value $conteudo -Encoding UTF8
Write-Host "✅ Script corrigido e salvo em: $arquivo" -ForegroundColor Green

# Verifica se o erro persiste
try {
    $tokens = [System.Management.Automation.PSParser]::Tokenize($conteudo, [ref]$null)
    Write-Host "✔️ Nenhum erro de sintaxe encontrado no script." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Ainda há erro de sintaxe, revise manualmente a linha indicada:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "🏁 Concluído!" -ForegroundColor Cyan
