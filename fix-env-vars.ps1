# Script: fix-env-vars.ps1
# Objetivo: Corrigir todas as variáveis de ambiente no formato incorreto ${$env}:VAR → $env:VAR
# Local: mesma pasta do ultrabiologico-deploy.ps1

$arquivo = "C:\Users\Administrador\pecuariatech\ultrabiologico-deploy.ps1"

Write-Host "🔍 Corrigindo variáveis de ambiente no arquivo: $arquivo"

# Lê todo o conteúdo do arquivo
$conteudo = Get-Content $arquivo -Raw

# Substitui todas as ocorrências de ${$env}:VAR por $env:VAR
$conteudo = $conteudo -replace '\$\{\$env\}:(\w+)', '$env:$1'

# Salva de volta no mesmo arquivo
Set-Content -Path $arquivo -Value $conteudo -Encoding UTF8

Write-Host "✅ Variáveis de ambiente corrigidas com sucesso!"
