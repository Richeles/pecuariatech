# ============================================================
# Script: corrigir-ultra-stabilizer-v6.ps1
# Objetivo: Corrigir automaticamente erros de aspas e blocos
# ============================================================

Write-Host "🚀 Iniciando correção automática..." -ForegroundColor Cyan

# Localiza o arquivo
$arquivo = Get-ChildItem -Path . -Filter "ultra-stabilizer-v4.ps1" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $arquivo) {
    Write-Host "❌ Arquivo ultra-stabilizer-v4.ps1 não encontrado." -ForegroundColor Red
    exit
}

Write-Host "📂 Arquivo encontrado: $($arquivo.FullName)" -ForegroundColor Yellow

# Cria backup
$backup = "$($arquivo.FullName).bak"
Copy-Item $arquivo.FullName $backup -Force
Write-Host "📦 Backup criado em: $backup" -ForegroundColor Yellow

# Lê conteúdo
$conteudo = Get-Content $arquivo.FullName -Raw

# Corrige aspas incorretas (versão simplificada e compatível)
$conteudo = $conteudo -replace "'\"type\"'", '"type"'
$conteudo = $conteudo -replace "'\\\"type\\\"'", '"type"'
$conteudo = $conteudo -replace "if\s*\(\$text\s*-notmatch\s*'\"type\"'\)", 'if ($text -notmatch "\"type\"")'

# Corrige chaves de fechamento ausentes
$abertas  = ([regex]::Matches($conteudo, '{')).Count
$fechadas = ([regex]::Matches($conteudo, '}')).Count
if ($abertas -gt $fechadas) {
    $faltam = $abertas - $fechadas
    Write-Host "🛠 Adicionando $faltam chave(s) de fechamento '}' ausente(s)..." -ForegroundColor Yellow
    $conteudo += "`n" + ("}" * $faltam)
}

# Salva correções
Set-Content -Path $arquivo.FullName -Value $conteudo -Encoding UTF8
Write-Host "✅ Script salvo e corrigido: $($arquivo.FullName)" -ForegroundColor Green

# Valida sintaxe
try {
    $null = [System.Management.Automation.PSParser]::Tokenize($conteudo, [ref]$null)
    Write-Host "✔️ Nenhum erro de sintaxe encontrado!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Atenção: possível erro de sintaxe." -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Pergunta se deseja abrir o arquivo
$abrir = Read-Host "Deseja abrir o arquivo corrigido no Bloco de Notas? (S/N)"
if ($abrir -match '^[sS]') {
    Start-Process notepad.exe $arquivo.FullName
}

Write-Host "🏁 Concluído!" -ForegroundColor Cyan
