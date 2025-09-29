<#
.SYNOPSIS
Monitoramento do site PecuariaTech e envio de alerta via WhatsApp Cloud API.
.DESCRIPTION
Script único que checa periodicamente o site https://www.pecuariatech.com e envia alerta no WhatsApp se o site estiver fora do ar.
#>

param(
    [string]$SiteUrl = "https://www.pecuariatech.com",
    [int]$IntervalSeconds = 60,  # Intervalo de checagem em segundos
    [string]$AccessToken = "EAAG....SEU_TOKEN_AQUI....",   # Substitua pelo token real da Meta
    [string]$PhoneNumberId = "123456789012345",           # Substitua pelo Phone Number ID da sua conta
    [string]$To = "5567999564560",                        # Seu número: +55 (67) 99956-4560
    [string]$MessageTemplate = "🚨 Alerta: O site PecuariaTech está offline!"
)

function Send-WhatsAppAlert {
    param(
        [string]$Message
    )

    $Url = "https://graph.facebook.com/v17.0/$PhoneNumberId/messages"
    $Header = @{
        "Authorization" = "Bearer $AccessToken"
        "Content-Type"  = "application/json"
    }
    $Body = @{
        messaging_product = "whatsapp"
        to = $To
        type = "text"
        text = @{
            body = $Message
        }
    } | ConvertTo-Json -Depth 3

    try {
        $response = Invoke-RestMethod -Method Post -Uri $Url -Headers $Header -Body $Body
        Write-Host "✅ Alerta enviado com sucesso para WhatsApp: $To" -ForegroundColor Green
    } catch {
        Write-Host "❌ Falha ao enviar alerta: $_" -ForegroundColor Red
    }
}

Write-Host "🔄 Monitoramento iniciado para $SiteUrl..." -ForegroundColor Cyan

while ($true) {
    try {
        $req = Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing -TimeoutSec 15
        if ($req.StatusCode -eq 200) {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') ✅ Site online." -ForegroundColor Green
        } else {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') ⚠️ Site retornou status $($req.StatusCode)." -ForegroundColor Yellow
            Send-WhatsAppAlert -Message $MessageTemplate
        }
    } catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') ❌ Site inacessível!" -ForegroundColor Red
        Send-WhatsAppAlert -Message $MessageTemplate
    }

    Start-Sleep -Seconds $IntervalSeconds
}
