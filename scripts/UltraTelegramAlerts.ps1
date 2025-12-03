$TOKEN = "SEU_TOKEN_AQUI"
$CHAT = "SEU_CHAT_ID_AQUI"
$MESSAGE = $args[0]

Invoke-RestMethod -Uri "https://api.telegram.org/bot$TOKEN/sendMessage" `
  -Method Post -Body @{ chat_id=$CHAT; text=$MESSAGE }

Write-Host "📨 Alerta enviado para o Telegram" -ForegroundColor Green
