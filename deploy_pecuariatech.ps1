# ===========================================================
# Script PowerShell Avançado: Git + Next.js + Vercel + Domínio
# ===========================================================

# -------- CONFIGURAÇÃO GIT ----------
$gitUserName = "Richeles"
$gitUserEmail = "richeles32@gmail.com"  # ajuste se precisar
$gitBranch = "main"

Write-Host "🔧 Configurando Git..."
git config --global user.name $gitUserName
git config --global user.email $gitUserEmail

# -------- COMMIT AUTOMÁTICO ----------
Write-Host "📦 Adicionando todas as alterações..."
git add .

$changes = git status --porcelain
if ($changes) {
    $commitMessage = "Atualização automática $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Host "✍️ Fazendo commit: $commitMessage"
    git commit -m "$commitMessage"
} else {
    Write-Host "ℹ️ Nenhuma alteração para commitar."
}

# -------- PUSH PARA GITHUB ----------
Write-Host "⬆️ Enviando alterações para GitHub..."
git push origin $gitBranch

# -------- INICIA NEXT.JS ----------
Write-Host "🚀 Iniciando servidor Next.js em localhost:3000..."
Start-Process "powershell" "npm run dev"

# -------- DEPLOY VERCEL ----------
Write-Host "🌐 Realizando deploy no Vercel..."
vercel --prod

# -------- INTEGRAÇÃO DE DOMÍNIO ---------
$domain = "www.pecuariatech.com"
Write-Host "`n🔗 Adicionando domínio no Vercel: $domain"
vercel domains add $domain

Write-Host "`n💡 ATENÇÃO:"
Write-Host "1. No seu provedor de domínio, configure o CNAME 'www' apontando para 'cname.vercel-dns.com'."
Write-Host "2. Depois de configurar, execute o comando abaixo para verificar se o domínio está ativo:"
Write-Host "   vercel domains inspect $domain"

Write-Host "`n✅ Tudo concluído!"
Write-Host "🔹 Servidor local: http://localhost:3000"
Write-Host "🔹 Deploy Vercel: https://$domain (após configuração do DNS)"
