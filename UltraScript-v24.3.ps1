# ================================
# UltraScript v24.3 – PECUARIATECH
# Script único para rodar e monitorar o projeto
# Autor: ChatGPT & Richeles
# ================================

$whatsappNumber = "5567999564560"     # Número que receberá alertas
$domain = "https://www.pecuariatech.com"
$supabaseUrl = "https://gjpqahnbfkeucqtwxeai.supabase.co"
$projectPath = "C:\Users\Administrador\pecuariatech"

function Send-WhatsApp($msg) {
    try {
        Invoke-RestMethod -Method POST `
            -Uri "https://api.callmebot.com/whatsapp.php" `
            -Body @{
                phone = $whatsappNumber
                text  = $msg
            }
    } catch {
        Write-Host "⚠️ Falha ao enviar alerta WhatsApp"
    }
}

Write-Host "🔵 UltraScript v24.3 — Iniciando..."
Start-Sleep -Seconds 1

# 1) VERIFICAÇÕES INICIAIS
Write-Host "🔍 Checando ambiente..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado"
    Send-WhatsApp "❌ PecuariaTech: Node.js não instalado."
    exit
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ NPM não encontrado"
    Send-WhatsApp "❌ PecuariaTech: NPM não instalado."
    exit
}

Write-Host "✅ Node e NPM ok"

# 2) CHECAR SUPABASE
function Test-Supabase {
    try {
        $r = Invoke-RestMethod "$supabaseUrl/rest/v1/" -TimeoutSec 5
        return $true
    } catch { return $false }
}

Write-Host "🔍 Testando Supabase..."
if (Test-Supabase) {
    Write-Host "🟢 Supabase OK"
} else {
    Write-Host "🔴 Supabase fora do ar!"
    Send-WhatsApp "🔴 PecuariaTech: SUPABASE OFFLINE!"
}

# 3) CHECAR DOMÍNIO
Write-Host "🔍 Testando domínio..."

try {
    Invoke-WebRequest $domain -TimeoutSec 5 | Out-Null
    Write-Host "🟢 Domínio online"
} catch {
    Write-Host "🔴 Dominio fora do ar!"
    Send-WhatsApp "🔴 PecuariaTech: DOMÍNIO OFFLINE!"
}

# 4) INICIAR PROJETO
Write-Host "🚀 Iniciando projeto PecuariaTech..."
Set-Location $projectPath

Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal
Write-Host "🟢 Projeto iniciado em nova janela!"

Send-WhatsApp "🟢 PecuariaTech iniciado no servidor!"

# 5) MONITORAMENTO LOOP
Write-Host "🔄 Ativando monitoramento contínuo..."
while ($true) {

    # Monitor supabase
    if (-not (Test-Supabase)) {
        Write-Host "🔴 Supabase caiu!"
        Send-WhatsApp "🔴 ALERTA: Supabase caiu!"
    }

    # Monitor domínio
    try {
        Invoke-WebRequest $domain -TimeoutSec 5 | Out-Null
    } catch {
        Write-Host "🔴 Dominio offline!"
        Send-WhatsApp "🔴 ALERTA: Dominio fora do ar!"
    }

    Start-Sleep -Seconds 20
}
