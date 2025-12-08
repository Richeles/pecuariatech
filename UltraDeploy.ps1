Write-Host '🐂 UltraDeploy — Iniciando pipeline automático...' -ForegroundColor Cyan

# Caminho do projeto
$projectPath = "C:\Users\Administrador\pecuariatech"
Set-Location $projectPath

# Checar se é repo Git
if (-not (Test-Path ".git")) {
    Write-Host '❌ Este diretório NÃO é um repositório git!' -ForegroundColor Red
    exit 1
}

Write-Host '✔ Repositório Git detectado.' -ForegroundColor Green

# Etapa 1 — commit automático
Write-Host '📌 Commitando alterações...' -ForegroundColor Yellow
git add .
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "UltraDeploy AutoCommit $timestamp"

# Etapa 2 — push para main
Write-Host '⬆️ Enviando código para main...' -ForegroundColor Yellow
git push origin main --force

# Etapa 3 — deploy Vercel
Write-Host '🚀 Publicando na produção (Vercel)...' -ForegroundColor Green
vercel --prod --yes

Write-Host '🎉 Deploy automático concluído com sucesso!' -ForegroundColor Green
Write-Host '🌍 Acesse agora: https://www.pecuariatech.com' -ForegroundColor Cyan
