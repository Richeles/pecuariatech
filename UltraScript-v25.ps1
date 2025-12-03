# ============================================================
# ULTRASCRIPT v25 CORRIGIDO — PECUARIATECH
# Versão aperfeiçoada com logs, monitoramento e alertas
# WhatsApp API corrigida (CallMeBot)
# Autor: ChatGPT & Richeles – 2025
# ============================================================

# ===== CONFIGURAÇÕES PRINCIPAIS =====
$whatsappNumber = "5567999564560"
$domain = "https://www.pecuariatech.com"
$statsEndpoint = "$domain/api/ultra/stats"
$supabaseUrl = "https://gjpqahnbfkeucqtwxeai.supabase.co/rest/v1/"
$projectPath = "C:\Users\Administrador\pecuariatech"
$logFile = "$projectPath\logs\ultrascript.log"

# ===== Criar pasta de logs se não existir =====
if (-not (Test-Path "$projectPath\logs")) {
    New-Item -Path "$projectPath\logs" -ItemType Directory | Out-Null
}

# ===== Função de Log =====
function Log($msg) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $line = "[$timestamp] $msg"
    Add-Content -Path $logFile -Value $line
    Write-Host $line
}

# ===== Enviar alerta WhatsApp (corrigido CallMeBot) =====
function Send-WhatsApp($msg) {
    if (-not $whatsappNumber) {
        Log "⚠️ Número WhatsApp não definido!"
        return
    }

    # Encode da mensagem
    $encodedMsg = [System.Web.HttpUtility]::UrlEncode($msg)
    $url = "https://api.callmebot.com/whatsapp.php?phone=$whatsappNumber&text=$encodedMsg"

    try {
        Invoke-RestMethod -Uri $url -Method Get
        Log "WhatsApp enviado: $msg"
    } catch {
        Log "ERRO ao enviar WhatsApp!"
    }
}

Log "================ INICIANDO ULTRASCRIPT v25 ================"
Start-Sleep -Seconds 1

# ===== Verificação Node, NPM, Git =====
Log "Checando ambiente..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Log "❌ Node.js não encontrado"; Send-WhatsApp "❌ Node.js não instalado no servidor"; exit }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Log "❌ NPM não encontrado"; Send-WhatsApp "❌ NPM não instalado"; exit }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Log "❌ GIT não encontrado"; Send-WhatsApp "❌ Git não encontrado"; exit }

Log "✔ Node, NPM e Git OK"

# ===== Acessar projeto =====
Log "Entrando no diretório do projeto: $projectPath"
Set-Location $projectPath

# ===== Instalar dependências se faltar =====
if (-not (Test-Path "$projectPath\node_modules")) {
    Log "📦 Instalando dependências NPM..."
    npm install | Out-Null
    Log "✔ Dependências instaladas"
}

# ===== Testar Supabase =====
function Test-Supabase {
    try {
        Invoke-RestMethod $supabaseUrl -TimeoutSec 5 | Out-Null
        return $true
    } catch { return $false }
}

Log "🔍 Testando Supabase..."
if (Test-Supabase) { Log "🟢 Supabase OK" }
else {
    Log "🔴 Supabase offline!"
    Send-WhatsApp "🔴 ALERTA: Supabase OFFLINE!"
}

# ===== Testar domínio =====
try {
    Invoke-WebRequest $domain -TimeoutSec 5 | Out-Null
    Log "🟢 Domínio online"
} catch {
    Log "🔴 Domínio OFFLINE!"
    Send-WhatsApp "🔴 ALERTA: Dominio pecuariatech.com offline!"
}

# ===== Testar rota /api/ultra/stats =====
try {
    Invoke-RestMethod $statsEndpoint -TimeoutSec 5 | Out-Null
    Log "🟢 API /ultra/stats OK"
} catch {
    Log "🟡 API /ultra/stats falhou!"
}

# ===== Iniciar NEXT.JS =====
Log "🚀 Iniciando Next.js em nova janela..."
Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal
Send-WhatsApp "🟢 PecuariaTech INICIADO com sucesso!"

# ===== MONITORAMENTO =====
Log "🔄 Iniciando monitoramento contínuo (loop 24/7)..."

while ($true) {

    # Supabase
    if (-not (Test-Supabase)) {
        Log "🔴 Supabase caiu!"
        Send-WhatsApp "🔴 ALERTA: Supabase caiu!"
    }

    # Domínio
    try {
        Invoke-WebRequest $domain -TimeoutSec 5 | Out-Null
    } catch {
        Log "🔴 Domínio OFFLINE!"
        Send-WhatsApp "🔴 ALERTA: Dominio pecuariatech.com OFFLINE!"
    }

    # API stats
    try {
        Invoke-RestMethod $statsEndpoint -TimeoutSec 5 | Out-Null
    } catch {
        Log "🟡 API /ultra/stats instável!"
    }

    # Restart automático se npm/node cair
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if (!$nodeProcesses) {
        Log "⚠️ Servidor Next.js caiu — reiniciando..."
        Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal
        Send-WhatsApp "⚠️ Next.js caiu, mas foi reiniciado!"
    }

    Start-Sleep -Seconds 20
}
