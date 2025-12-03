# ================================
# 🔱 PECUARIATECH — UltraRun 360º v6
# Script Único - PowerShell
# ================================

Clear-Host
Write-Host ""
Write-Host "🔰 INICIANDO PECUARIATECH — UltraRun 360º v6..." -ForegroundColor Cyan

# --------------------------------
# 1) VARIÁVEIS GLOBAIS
# --------------------------------
$TELEGRAM_TOKEN = "8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg"
$CHAT_ID = "7655188256"
$SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDcxNTIsImV4cCI6MjA2NjM4MzE1Mn0.0QL2lRFVTXTr_2DFV0dywfElLzXirgFvx0qZRWPZUSQ"

$LOGFILE = "$PSScriptRoot\ultra_log.txt"

# Função log
function Log($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp — $msg" | Out-File -Append $LOGFILE
}

# Função Telegram Notify
function Send-Telegram($text) {
    $url = "https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage"
    $body = @{ chat_id = $CHAT_ID; text = $text }
    try {
        Invoke-RestMethod -Uri $url -Method Post -Body $body | Out-Null
    } catch {
        Log "Erro ao enviar Telegram: $_"
    }
}

Send-Telegram "🚀 UltraRun iniciou no servidor local..."

# --------------------------------
# 2) LIMPEZA INTELIGENTE
# --------------------------------
Write-Host "🧹 Limpando arquivos desnecessários..." -ForegroundColor Yellow
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".vercel" -ErrorAction SilentlyContinue
Log "Limpeza feita"

# --------------------------------
# 3) TESTE DO SUPABASE
# --------------------------------
Write-Host "🧪 Testando Supabase..." -ForegroundColor Yellow
try {
    $headers = @{ apikey = $SUPABASE_KEY; Authorization = "Bearer $SUPABASE_KEY" }
    $res = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/?select=*" -Headers $headers -ErrorAction Stop
    Write-Host "✅ Supabase OK" -ForegroundColor Green
    Send-Telegram "🟢 Supabase está respondendo!"
    Log "Supabase OK"
}
catch {
    Write-Host "❌ ERRO Supabase" -ForegroundColor Red
    Send-Telegram "🔴 ERRO: Supabase não respondeu!"
    Log "Supabase DEU ERRO"
}

# --------------------------------
# 4) DEPLOY VERCEL
# --------------------------------
Write-Host "🚀 Enviando deploy para Vercel..." -ForegroundColor Cyan
Send-Telegram "📡 Enviando deploy para a Vercel..."

try {
    vercel --prod --yes | Tee-Object -FilePath $LOGFILE -Append
    Write-Host "✅ Deploy enviado" -ForegroundColor Green
    Send-Telegram "🟢 Deploy concluído com sucesso!"
}
catch {
    Write-Host "❌ ERRO NO DEPLOY" -ForegroundColor Red
    Send-Telegram "🔴 ERRO: Deploy falhou!"
    Log "Deploy falhou"
}

# --------------------------------
# 5) TESTE DA ROTA
# --------------------------------
Write-Host "🌐 Testando rota /api/health..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "https://www.pecuariatech.com/api/health" -UseBasicParsing -TimeoutSec 20
    Write-Host "✅ Rota ativa" -ForegroundColor Green
    Send-Telegram "🌐 Rota /api/health está ONLINE!"
    Log "Health OK"
}
catch {
    Write-Host "❌ ROTA OFFLINE" -ForegroundColor Red
    Send-Telegram "🔴 Rota /api/health NÃO responde!"
    Log "Health FAIL"
}

# --------------------------------
# 6) FINALIZAÇÃO
# --------------------------------
Write-Host "🏁 UltraRun Finalizado!" -ForegroundColor Cyan
Send-Telegram "🏁 UltraRun 360º Finalizado!"
Log "Script finalizado"
