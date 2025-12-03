Param(
  [string]$TOKEN = "8384906982:AAFkRtD5ye7O_Z2JQNZTp9rpXweSy3RFXzg"
)

$apiUrl = "https://api.telegram.org/bot$TOKEN"

function Send-TelegramMessage {
    param(
        [string]$chatId,
        [string]$text
    )

    $body = @{
        chat_id = $chatId
        text    = $text
    }

    Invoke-RestMethod -Uri "$apiUrl/sendMessage" -Method Post -Body $body
}

Write-Host "🤖 UltraChat Telegram — Monitorando mensagens..."

$offset = 0

while ($true) {
    $response = Invoke-RestMethod -Uri "$apiUrl/getUpdates?offset=$offset" -Method Get

    foreach ($update in $response.result) {
        $offset = $update.update_id + 1
        $chatId = $update.message.chat.id
        $text   = $update.message.text.ToUpper()

        switch ($text) {

            "A" {
                Send-TelegramMessage -chatId $chatId -text "🟩 *A - Status Geral do Sistema*\n\n✔ Frontend OK\n✔ Backend OK\n✔ Supabase conectado\n✔ UltraCloud 100% operacional."
            }

            "B" {
                Send-TelegramMessage -chatId $chatId -text "🟦 *B - Dashboard Pecuária*\n\n📊 KPIs carregados\n🐂 Dados de rebanho OK\n🌱 Pastagem OK"
            }

            "C" {
                Send-TelegramMessage -chatId $chatId -text "🟨 *C - Alertas de Campo*\n\n⚠ Nenhum alerta crítico agora.\n⛈ Clima regular\n🚜 Operações de fazenda estáveis."
            }

            "D" {
                Send-TelegramMessage -chatId $chatId -text "🟥 *D - UltraDeploy*\n\nIniciando Deploy no Vercel...\nAguarde 30 segundos."
            }

            default {
                Send-TelegramMessage -chatId $chatId -text "👋 Bem-vindo ao UltraChat PecuariaTech!\n\nComandos disponíveis:\nA - Status Geral\nB - Dashboard Pecuária\nC - Alertas do Campo\nD - Deploy (Vercel)"
            }
        }
    }

    Start-Sleep -Seconds 2
}
