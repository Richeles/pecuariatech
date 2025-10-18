# deploy_root_fix.ps1
# Script PowerShell: Corrige raiz do site e faz deploy completo para www.pecuariatech.com

Set-ExecutionPolicy Bypass -Scope Process -Force

$ProjectRoot = Get-Location
$LogFile = "$ProjectRoot\vercel_deploy_log.txt"
$Branch = "main"
$VercelDomain = "www.pecuariatech.com"

Write-Host "[INFO] 🚀 Iniciando correção da raiz e deploy UltraBiológica Cloud final..."

# 1️⃣ Criar página raiz app/page.tsx que redireciona para /dashboard
$PagePath = "$ProjectRoot\app\page.tsx"
if (-Not (Test-Path $PagePath)) {
    @"
import { redirect } from 'next/navigation';

export default function Home() {
    redirect('/dashboard');
}
"@ | Set-Content -Path $PagePath -Encoding UTF8 -Force
    Write-Host "[INFO] ✅ Página raiz app/page.tsx criada com redirecionamento para /dashboard"
} else {
    Write-Host "[INFO] ⚠️ app/page.tsx já existe, será sobrescrito"
    @"
import { redirect } from 'next/navigation';

export default function Home() {
    redirect('/dashboard');
}
"@ | Set-Content -Path $PagePath -Encoding UTF8 -Force
}

# 2️⃣ Adicionar, commitar e enviar alterações para GitHub
git add .
git commit -m "fix: adicionar página raiz / redirecionamento para /dashboard" -a
git push origin $Branch
Write-Host "[INFO] 📦 Alterações enviadas ao GitHub"

# 3️⃣ Deploy para Vercel
Write-Host "[INFO] 🚀 Iniciando deploy de produção na Vercel..."
$VercelCmd = "vercel --prod --yes --confirm --alias $VercelDomain"
& $VercelCmd 2>&1 | Tee-Object -FilePath $LogFile
Write-Host "[INFO] ✅ Deploy finalizado. Log salvo em: $LogFile"
Write-Host "[INFO] 🌐 Site disponível em: https://$VercelDomain"
