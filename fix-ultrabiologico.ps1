# Script: fix-ultrabiologico.ps1
# Objetivo: corrigir variáveis com ":" no arquivo ultrabiologico-deploy.ps1

$arquivo = "C:\Users\Administrador\pecuariatech\ultrabiologico-deploy.ps1"

Write-Host "🔍 Corrigindo variáveis no arquivo: $arquivo"

# Lê todo o conteúdo
$conteudo = Get-Content $arquivo -Raw

# Corrige os casos de $nomeDaVariavel: → ${nomeDaVariavel}:
$conteudo = $conteudo -replace '(\$\w+):', '${$1}:'

# Salva de volta no mesmo arquivo
Set-Content -Path $arquivo -Value $conteudo -Encoding UTF8

Write-Host "✅ Correções aplicadas com sucesso no arquivo!"
