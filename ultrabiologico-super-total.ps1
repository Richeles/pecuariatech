param(
    [string]\ = "pecuariatech.com",
    [string]\ = "pecuariatech",
    [string]\ = "<SEU_TOKEN_META>",
    [string]\ = "<SEU_PHONE_NUMBER_ID>",
    [string]\ = "5567999564560",
    [string]\ = "<SEU_TOKEN_BOT>",
    [string]\ = "<SEU_CHAT_ID>",
    [int]\ = 3
)

\C:\Users\Administrador\pecuariatech\ultrabiologico-total-log.txt = "$PSScriptRoot\ultrabiologico-total-log.txt"
function Write-Stamp(\) {
    \ = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    \ = "\ \"
    Write-Host \
    Add-Content -Path \C:\Users\Administrador\pecuariatech\ultrabiologico-total-log.txt -Value \ -Encoding UTF8
}

function Send-WhatsAppAlert(\) {
    \ = "https://graph.facebook.com/v17.0/\/messages"
    \ = @{ "Authorization" = "Bearer \"; "Content-Type" = "application/json" }
    \ = @{ messaging_product="whatsapp"; to=\; type="text"; text=@{body=\} } | ConvertTo-Json -Depth 3
    try { Invoke-RestMethod -Method Post -Uri \ -Headers \ -Body \; Write-Stamp "✅ WhatsApp enviado." } catch { Write-Stamp "❌ WhatsApp falhou: $_" }
}

function Send-TelegramAlert(\) {
    \ = "https://api.telegram.org/bot\/sendMessage"
    \ = @{ chat_id=\; text=\ } | ConvertTo-Json
    try { Invoke-RestMethod -Method Post -Uri \ -Body \ -ContentType "application/json"; Write-Stamp "✅ Telegram enviado." } catch { Write-Stamp "❌ Telegram falhou: $_" }
}

function Send-AllAlerts(\) { Send-WhatsAppAlert \; Send-TelegramAlert \ }

function Build-And-Deploy { Write-Stamp "🔧 Instalando dependências e rodando build..."; npm install; npm run build; Write-Stamp "🚀 Deploy no Vercel..."; vercel --prod --confirm; Write-Stamp "✅ Deploy concluído." }

function Configure-Domain {
    Write-Stamp "🌐 Configurando domínio \..."
    vercel domains add \ --yes
    vercel domains add "www.\" --yes
    vercel alias set \ "www.\" --yes
    function Test-DNS { param([string]\) try { \=(Resolve-DnsName \ -Type CNAME -ErrorAction Stop).NameHost; return \ -like "*vercel-dns.com" } catch { return \False } }
    \ = \False
    for (\=0; \ -lt 15; \++) {
        if (Test-DNS "www.\") { Write-Stamp "✅ DNS já aponta para Vercel."; \=\True; break } 
        else { Write-Stamp ("⏳ Aguardando propagação DNS... (tentativa {0}/15)" -f (\+1)); Start-Sleep -Seconds 60 }
    }
    if (-not \) { Write-Stamp "❌ DNS não propagou, verifique manualmente." }
}

function Start-GPSIntegration { Write-Stamp "📡 Iniciando integração GPS (placeholder)..." }
function Generate-ProjectImage { Write-Stamp "🖼 Gerando imagem do projeto (placeholder)..."; \="\\pecuariatech-highres.png"; Write-Stamp "✅ Imagem gerada em: \" }

function Check-Site { try { \ = Invoke-WebRequest "https://www.\" -UseBasicParsing -TimeoutSec 10; return \.StatusCode -eq 200 } catch { return \False } }

Build-And-Deploy
Configure-Domain
Start-GPSIntegration
Generate-ProjectImage

Write-Stamp "🔄 Monitoramento contínuo iniciado em background..."
\=0

Start-Job -ScriptBlock {
    param(\, \, \)
    while (\True) {
        \ = \False
        try { \ = (Invoke-WebRequest "https://www.\" -UseBasicParsing -TimeoutSec 10).StatusCode -eq 200 } catch {}
        if (-not \) { \++; Write-Host "⚠️ Falha detectada: \/\"
            if (\ -ge \) {
                & \ "🚨 Site PecuariaTech caiu \ vezes consecutivas! Tentando redeploy..."
                Write-Host "🔧 Reiniciando deploy..."; npm install; npm run build; vercel --prod --confirm; Write-Host "✅ Redeploy concluído."
                \=0
            }
        } else { \=0 }
        Start-Sleep -Seconds 60
    }
} -ArgumentList ,,(Get-Command Send-AllAlerts)

