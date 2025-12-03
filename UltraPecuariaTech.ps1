# ============================================
# UltraPecuariaTech v2 — Script Único Oficial
# Monitoramento 360º + Supabase + Telegram
# ============================================

$ErrorActionPreference = "SilentlyContinue"

# ======================
# CONFIGURAÇÕES GERAIS
# ======================
$PROJECT_PATH = "C:\Users\Administrador\pecuariatech"
$SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDcxNTIsImV4cCI6MjA2NjM4MzE1Mn0.0QL2lRFVTXTr_2DFV0dywfElLzXirgFvx0qZRWPZUSQ"

# ======================
# TELEGRAM
# ======================
$TELEGRAM_TOKEN = "8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg"
$CHAT_ID = "7655188256"
$TG_URL = "https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage"

function Send-TG {
    param ([string]$msg)

    Invoke-WebRequest -Uri $TG_URL `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            chat_id = $CHAT_ID
            text = $msg
        } | ConvertTo-Json -Depth 5) | Out-Null
}

# ======================
# INÍCIO
# ======================
Write-Host "🚀 Iniciando UltraPecuariaTech 360º..."
Send-TG "🚀 Iniciando UltraPecuariaTech 360º..."

# ======================
# CHECA PASTA
# ======================
if (!(Test-Path $PROJECT_PATH)) {
    Send-TG "❌ ERRO: Pasta não encontrada!"
    exit
}

Write-Host "📁 Pasta encontrada: $PROJECT_PATH"
Send-TG "📁 Pasta encontrada: $PROJECT_PATH"

cd $PROJECT_PATH

# ======================
# TESTA SUPABASE
# ======================
Write-Host "🟦 Testando Supabase..."
Send-TG "🟦 Testando Supabase..."

try {
    $response = Invoke-WebRequest `
        -Uri "$SUPABASE_URL/rest/v1/" `
        -Headers @{apiKey = $SUPABASE_KEY} `
        -TimeoutSec 10

    Write-Host "🟢 SUPABASE ONLINE"
    Send-TG "🟢 SUPABASE ONLINE"
}
catch {
    Write-Host "❌ SUPABASE OFFLINE"
    Send-TG "❌ SUPABASE OFFLINE"
}

# ======================
# INSTALA DEPENDÊNCIAS
# ======================
Write-Host "📦 Instalando dependências..."
Send-TG "📦 Instalando dependências..."

npm install

Write-Host "📦 Dependências instaladas."
Send-TG "📦 Dependências instaladas."

# ======================
# START DO NEXT.JS
# ======================
Write-Host "🟩 Iniciando ambiente..."
Send-TG "🟩 Iniciando ambiente..."

Start-Process powershell -ArgumentList "npm run dev"

Start-Sleep -Seconds 12

Write-Host "🌐 Servidor iniciado em http://localhost:3000"
Send-TG "🌐 Servidor iniciado em http://localhost:3000"

# ======================
# TESTA API /ultra/stats
# ======================
try {
    $api = Invoke-WebRequest "http://localhost:3000/api/ultra/stats" -TimeoutSec 10
    Write-Host "🟢 API UltraStats OK"
    Send-TG "🟢 API UltraStats OK"
}
catch {
    Write-Host "❌ API UltraStats falhou."
    Send-TG "❌ API UltraStats falhou."
}

# ======================
# DEPLOY VERCEL
# ======================
Write-Host "⬆️ Deploy Vercel..."
Send-TG "⬆️ Realizando deploy no Vercel..."

vercel --yes

Write-Host "🟢 Deploy finalizado!"
Send-TG "🟢 Deploy finalizado!"

# ======================
# FINAL
# ======================
Write-Host "🎉 UltraPecuariaTech finalizado."
Send-TG "🎉 UltraPecuariaTech finalizado!"
