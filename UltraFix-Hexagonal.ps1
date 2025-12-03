<#
.SYNOPSIS
UltraFix-Hexagonal: Automatiza a remoção de arquivos grandes do histórico Git e força push.
Institucionaliza o processo para execução recorrente.

.DESCRIPTION
1. Verifica Python e Pip
2. Instala git-filter-repo se necessário
3. Remove arquivos gigantes do histórico
4. Força push para o GitHub
5. Pode ser executado repetidamente sem risco

#>

# =========================
# 1️⃣ Verificar Python
# =========================
Write-Host "🔹 Verificando Python..." -ForegroundColor Cyan
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "⚠ Python não encontrado! Instale Python 3.12+ e marque 'Add to PATH'" -ForegroundColor Red
    exit
} else {
    python --version
}

# =========================
# 2️⃣ Verificar Pip
# =========================
Write-Host "🔹 Verificando Pip..." -ForegroundColor Cyan
$pipVersion = & python -m pip --version 2>$null
if (-not $pipVersion) {
    Write-Host "⚠ Pip não encontrado! Instalando pip..." -ForegroundColor Yellow
    python -m ensurepip --upgrade
}

# =========================
# 3️⃣ Instalar git-filter-repo
# =========================
Write-Host "🔹 Instalando git-filter-repo..." -ForegroundColor Cyan
& python -m pip install --upgrade git-filter-repo

# =========================
# 4️⃣ Limpeza de arquivos gigantes (pasta backups)
# =========================
$targetFolder = "backups"
Write-Host "🔹 Limpando histórico Git para a pasta: $targetFolder ..." -ForegroundColor Cyan

# Checar se pasta existe no histórico
if (Test-Path $targetFolder) {
    Write-Host "✅ Pasta $targetFolder existe. Aplicando operador X..." -ForegroundColor Green
    git filter-repo --path $targetFolder --invert-paths
} else {
    Write-Host "⚠ Pasta $targetFolder não encontrada no diretório atual. Checando histórico..." -ForegroundColor Yellow
    git filter-repo --path $targetFolder --invert-paths
}

# =========================
# 5️⃣ Forçar push para GitHub
# =========================
Write-Host "🔹 Forçando push para GitHub..." -ForegroundColor Cyan
git push origin main --force

# =========================
# 6️⃣ Verificação final
# =========================
Write-Host "✅ Processo concluído!" -ForegroundColor Green
Write-Host "🔹 Teste o webhook do UltraChat:" -ForegroundColor Cyan
Write-Host "https://www.pecuariatech.com/api/ultrachat/webhook"
