# ============================================================
# Script: corrigir-ultra-stabilizer-v5.ps1
# Autor: Richeles (versão aprimorada GPT-5)
# Objetivo: Corrigir automaticamente erros de aspas e blocos
#           no script ultra-stabilizer-v4.ps1
# ============================================================

Write-Host "🚀 Iniciando verificação do script ultra-stabilizer-v4.ps1..." -ForegroundColor Cyan

# 1️⃣ Localiza automaticamente o arquivo no diretório atual
$arquivo = Get-ChildItem -Path . -Filter "ultra-stabilizer-v4.ps1" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $arquivo) {
    Write-Host "❌ Não foi possível localizar 'ultra-stabilizer-v4.ps1' nesta pasta." -ForegroundColor Red
    exit
}

Write-Host "📂 Arquivo localizado em: $($arquivo.FullName)" -ForegroundColor Yellow

# 2️⃣ Cria backup automático
$backup = "$($arquivo.FullName).bak"
Copy-Item $arquivo.FullName $backup -Force
Write-Host "📦 Backup criado: $backup" -ForegroundColor Yellow

# 3️⃣ Lê o conteúdo do arquivo
$conteudo = Get-Content $arquivo.FullName -Raw

# 4️⃣ Corrige aspas comuns problemáticas
$substituicoes = @{
    "'\\\"type\\\"'" = '"type"'
    "'\"type\"'" = '"type"'
    'if\s*\(\$text\s*-notmatch\s*\'\"type\"\'\)' = 'if ($text -notmatch "\"type\"")'
}

foreach ($padrao in $substituicoes.Keys) {
    $antes = $conteudo
    $conteudo = [regex]::Replace($conteudo, $padrao, $substituicoes[$padrao])
    if ($conteudo -ne $antes) {
        Write-Host "🧩 Corrigido padrão: $padrao" -ForegroundColor Green
    }
}

# 5️⃣ Corrige erros de fechamento de blocos
$abertas = ([regex]::Matches($conteudo, '{')).Count
$fechadas = ([regex]::Matches($conteudo, '}')).Count

if ($abertas -gt $fechadas) {
    $faltam = $abertas - $fechadas
    Write-Host "🛠 Adicionando $faltam chave(s) de fechamento '}' ausente(s)..." -ForegroundColor Yellow
    $conteudo += "`n" + ("}" * $faltam)
}

# 6️⃣ Salva o arquivo corrigido
Set-Content -Path $arquivo.FullName -Value $conteudo -Encoding UTF8
Write-Host "✅ Script corrigido e salvo: $($arquivo.FullName)" -ForegroundColor Green

# 7️⃣ Valida sintaxe com o analisador interno do PowerShell
try {
    $null = [System.Management.Automation.PSParser]::Tokenize($conteudo, [ref]$null)
    Write-Host "✔️ Nenhum erro de sintaxe encontrado no script!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro de sintaxe detectado:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 8️⃣ Pergunta se deseja abrir o arquivo no Notepad
$abrir = Read-Host "Deseja abrir o arquivo corrigido no Bloco de Notas? (S/N)"
if ($abrir -match '^[sS]') {
    Start-Process notepad.exe $arquivo.FullName
}

Write-Host "🏁 Concluído com sucesso!" -ForegroundColor Cyan
