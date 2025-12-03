<#
restore-pecuariatech.ps1
Script autônomo para restaurar, buildar, publicar e notificar via WhatsApp (CallMeBot)
Local recomendado: C:\Users\Administrador\pecuariatech\
#>

# -----------------------------
# Configurações (edite apenas se necessário)
# -----------------------------
$telefone = "+5567999564560"           # Número no formato +55DDDNÚMERO
$apikey   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDcxNTIsImV4cCI6MjA2NjM4MzE1Mn0.0QL2lRFVTXTr_2DFV0dywfElLzXirgFvx0qZRWPZUSQ"
$supabaseUrl = "https://kpzzekflqpoeccnqfkng.supabase.co"  # URL do Supabase
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logDir = Join-Path $projectDir "logs"
$logFile = Join-Path $logDir ("restore-pecuariatech_{0:yyyyMMdd_HHmmss}.log" -f (Get-Date))

# Cria pasta de logs se não existir
if (-not (Test-Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

function Write-Log {
    param([string]$msg)
    $ts = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    $line = "[$ts] $msg"
    $line | Tee-Object -FilePath $logFile -Append | Out-Null
    Write-Host $line
}

# Início
Write-Log "Iniciando processo de restauração do PecuariaTech"
Write-Log "Diretório do script: $projectDir"
Write-Log "URL Supabase: $supabaseUrl"

# Segurança (desbloqueia o arquivo caso necessário)
try {
    Unblock-File -Path $MyInvocation.MyCommand.Path -ErrorAction Stop
    Write-Log "Arquivo desbloqueado com sucesso."
} catch {
    Write-Log "Aviso: não foi possível executar Unblock-File: $_"
}

# 1) Verifica se npm está disponível
try {
    $npmVersion = npm --version 2>$null
    Write-Log "npm version: $npmVersion"
} catch {
    Write-Log "Erro: npm não encontrado no PATH. Instale Node.js e npm antes de prosseguir."
    exit 1
}

# 2) Instala dependências
Write-Log "Instalando dependências (npm install)..."
Push-Location $projectDir
try {
    npm install 2>&1 | Tee-Object -FilePath $logFile -Append
    Write-Log "Dependências instaladas com sucesso."
} catch {
    Write-Log "Erro durante npm install: $_"
    Pop-Location
    exit 1
}

# 3) Build do projeto
Write-Log "Executando build (npm run build)..."
try {
    npm run build 2>&1 | Tee-Object -FilePath $logFile -Append
    Write-Log "Build concluído com sucesso."
} catch {
    Write-Log "Erro durante o build: $_"
    Pop-Location
    exit 1
}

# 4) Deploy na Vercel (assume que vercel CLI está autenticada e configurada)
Write-Log "Iniciando deploy para a Vercel (vercel --prod)"
try {
    $vercelOutput = vercel --prod 2>&1
    $vercelOutput | Tee-Object -FilePath $logFile -Append
    Write-Log "Deploy concluído. Saída do Vercel registrada."

    # extrai URL pública de forma segura
    if ($vercelOutput -match 'Production: (https?://\S+)') {
        $publicUrl = $matches[1].Trim()
    } else {
        $publicUrl = 'URL não encontrada na saída do Vercel'
    }
    Write-Log "URL pública: $publicUrl"
} catch {
    Write-Log "Erro durante deploy Vercel: $_"
    Pop-Location
    exit 1
}

Pop-Location

# 5) Envia notificação via WhatsApp (CallMeBot)
$mensagem = "🐮 Projeto PecuariaTech restaurado e publicado!`n$publicUrl`nSupabase: $supabaseUrl`nLogs: $logFile"
$mensagemEncoded = [System.Web.HttpUtility]::UrlEncode($mensagem)
$apiUrl = "https://api.callmebot.com/whatsapp.php?phone=$telefone&text=$mensagemEncoded&apikey=$apikey"

Write-Log "Enviando notificação WhatsApp para $telefone via CallMeBot"
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -ErrorAction Stop
    Write-Log "WhatsApp enviado com sucesso. Resposta do serviço: $response"
} catch {
    Write-Log "Falha ao enviar WhatsApp: $_"
}

# Final
Write-Log "Processo finalizado. Verifique o log: $logFile"
Write-Log "Mensagem final (resumo):"
Write-Log "🐮 Projeto restaurado e publicado com sucesso!"
Write-Log "🌎 $publicUrl"
Write-Log "✅ Tentativa de notificação WhatsApp registrada."

try {
    Start-Process notepad.exe -ArgumentList $logFile
} catch {
}

exit 0
