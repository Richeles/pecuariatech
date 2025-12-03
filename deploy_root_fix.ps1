# deploy_root_fix_final.ps1
# 🚀 Deploy UltraBiológica Cloud + alias automático para www.pecuariatech.com

$ErrorActionPreference = "Stop"
$LogFile = Join-Path $PWD "vercel_deploy_log.txt"

Write-Host "[INFO] 🚀 Iniciando deploy UltraBiológica Cloud final..." -ForegroundColor Cyan

# Backup da pasta app
$BackupPath = Join-Path $PWD ("backup_app_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
Copy-Item -Recurse -Path ".\app" -Destination $BackupPath
Write-Host "[INFO] ✅ Backup da pasta app criado em: $BackupPath" -ForegroundColor Green

# Git commit automático
git add .
git commit -m "fix: deploy root + redirecionamento /dashboard"
git push origin main
Write-Host "[INFO] 📦 Alterações enviadas ao GitHub" -ForegroundColor Green

# Deploy no Vercel
Write-Host "[INFO] 🚀 Iniciando deploy de produção no Vercel..." -ForegroundColor Cyan
$VercelOutput = vercel --prod --yes 2>&1 | Tee-Object -FilePath $LogFile
$DeployURL = ($VercelOutput | Select-String -Pattern "Production:" | ForEach-Object { $_.Line.Split()[-1] }).Trim()
Write-Host "[INFO] ✅ Deploy finalizado em: $DeployURL" -ForegroundColor Green

# Configurar alias para o domínio customizado
Write-Host "[INFO] 🌐 Configurando alias do domínio www.pecuariatech.com..." -ForegroundColor Cyan
vercel alias set $DeployURL www.pecuariatech.com | Tee-Object -FilePath $LogFile
Write-Host "[INFO] ✅ Alias configurado: https://www.pecuariatech.com → $DeployURL" -ForegroundColor Green

# Fim do script
Write-Host "[INFO] ✅ Script finalizado. Log completo em: $LogFile" -ForegroundColor Cyan
