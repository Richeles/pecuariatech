# ============================================
# PecuariaTech Deploy Script
# Deploy para Vercel + Teste Dominio
# ============================================

$dominio = "https://www.pecuariatech.com"
$vercel = "https://vercel.com"
$projetoPath = "C:\Users\Administrador\pecuariatech"

Write-Host "Iniciando Deploy PecuariaTech..."
Write-Host ""

# --------------------------------------------
# 1. Teste Rede
# --------------------------------------------
Write-Host "Teste 1 - Rede..."
if (Test-Connection -ComputerName "8.8.8.8" -Count 2 -Quiet) {
    Write-Host "Rede OK"
} else {
    Write-Host "Falha de rede. Encerrando."
    exit
}

# --------------------------------------------
# 2. Teste DNS do dominio
# --------------------------------------------
Write-Host "Teste 2 - DNS do dominio..."
try {
    Resolve-DnsName "www.pecuariatech.com" -ErrorAction Stop
    Write-Host "DNS do dominio OK"
}
catch {
    Write-Host "DNS nao propagado ainda."
    exit
}

# --------------------------------------------
# 3. Teste HTTP do dominio
# --------------------------------------------
Write-Host "Teste 3 - Verificando site online..."

try {
    $response = Invoke-WebRequest -Uri $dominio -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Write-Host "Site em producao respondendo: OK"
    }
}
catch {
    Write-Host "O site nao respondeu. A Vercel ainda nao subiu."
}

# --------------------------------------------
# 4. Build do projeto (Next.js)
# --------------------------------------------
Write-Host ""
Write-Host "Rodando build do projeto..."

cd $projetoPath

if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
}

npm install
npm run build

Write-Host "Build concluido."

# --------------------------------------------
# 5. Deploy para Vercel
# --------------------------------------------
Write-Host ""
Write-Host "Enviando deploy para Vercel..."

vercel --prod --confirm

Write-Host ""
Write-Host "Deploy finalizado!"
Write-Host "Acesse: $dominio"
