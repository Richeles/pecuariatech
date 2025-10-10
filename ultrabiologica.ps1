# UltraBiológica Cloud v3 - Script Único
# Autor: Richeles
# Descrição: Script completo para deploy, sincronização e monitoramento do PecuariaTech.

# --------------------------
# 1️⃣ Configurações iniciais
# --------------------------
$projectPath = "C:\Users\Administrador\pecuariatech"
$envFile = "$projectPath\.env.local"
$domain = "www.pecuariatech.com"
$telegramBotToken = "<SEU_TOKEN_TELEGRAM>"      # opcional
$telegramChatId = "<SEU_CHAT_ID>"              # opcional
$whatsappApiUrl = "<SEU_API_WHATSAPP>"         # opcional

# --------------------------
# 2️⃣ Definir política de execução
# --------------------------
Set-ExecutionPolicy Bypass -Scope Process -Force
cd $projectPath

# --------------------------
# 3️⃣ Função para log
# --------------------------
Function Write-Log($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $msg" | Tee-Object -FilePath "$projectPath\ultrabiologico-log.txt" -Append
}

Write-Log "Iniciando UltraBiológica Cloud..."

# --------------------------
# 4️⃣ Linkar Supabase
# --------------------------
Write-Log "Linkando projeto Supabase..."
try {
    supabase link --project-ref kpzzekflqpoeccnqfkng --yes
    Write-Log "Supabase link concluído."
} catch {
    Write-Log "Erro ao linkar Supabase: $_"
}

# --------------------------
# 5️⃣ Aplicar migrations
# --------------------------
Write-Log "Aplicando migrations..."
try {
    supabase db push --yes
    Write-Log "Migrations aplicadas."
} catch {
    Write-Log "Erro ao aplicar migrations: $_"
}

# --------------------------
# 6️⃣ Gerar arquivo .env.local
# --------------------------
Write-Log "Gerando arquivo .env.local..."
@"
NEXT_PUBLIC_SUPABASE_URL=https://kpzzekflqpoeccnqfkng.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_VERCEL_URL=https://$domain
"@ | Out-File -Encoding UTF8 $envFile

# --------------------------
# 7️⃣ Deploy no Vercel
# --------------------------
Write-Log "Iniciando deploy no Vercel..."
try {
    vercel --prod --yes
    Write-Log "Deploy Vercel concluído."
} catch {
    Write-Log "Erro no deploy Vercel: $_"
}

# --------------------------
# 8️⃣ Validar domínio
# --------------------------
Write-Log "Validando domínio..."
try {
    $response = Invoke-RestMethod -Uri "https://$domain" -Method Get
    Write-Log "Domínio ativo: https://$domain"
} catch {
    Write-Log "Erro ao validar domínio: $_"
}

# --------------------------
# 9️⃣ Enviar alerta opcional Telegram / WhatsApp
# --------------------------
Function Send-Telegram($message){
    if ($telegramBotToken -ne "" -and $telegramChatId -ne ""){
        $url = "https://api.telegram.org/bot$telegramBotToken/sendMessage?chat_id=$telegramChatId&text=$message"
        try { Invoke-RestMethod -Uri $url -Method Get | Out-Null } catch {}
    }
}
Function Send-WhatsApp($message){
    if ($whatsappApiUrl -ne ""){
        try { Invoke-RestMethod -Uri $whatsappApiUrl -Method Post -Body (@{text=$message} | ConvertTo-Json) } catch {}
    }
}

$message = "✅ UltraBiológica Cloud finalizado com sucesso! Acesse: https://$domain"
Send-Telegram $message
Send-WhatsApp $message

Write-Log "UltraBiológica Cloud finalizado!"
