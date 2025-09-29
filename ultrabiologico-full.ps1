# Script: ultrabiologico-full.ps1
# Objetivo: Colocar PecuariaTech ultrabiológico online, com monitoramento, alertas WhatsApp e GPS integrado.

param(
    [string]$Domain = "pecuariatech.com",
    [string]$Project = "pecuariatech",
    [string]$WhatsAppToken = "<SEU_TOKEN_META>",
    [string]$PhoneNumberId = "<SEU_PHONE_NUMBER_ID>",
    [string]$To = "5567999564560"   # Seu número com DDI
)

# Função de log com timestamp
function Write-Stamp($Message) {
    Write-Host "$(Get-Date -Format 'HH:mm:ss') $Message"
}

# 1️⃣ Build e deploy Next.js no Vercel
Write-Stamp "🔧 Rodando build e deploy no Vercel..."
npm install
npm run build
vercel --prod
Write-Stamp "✅ Deploy concluído."

# 2️⃣ Configurar domínio e SSL
Write-Stamp "🌐 Configurando domínio $Domain..."
vercel domains add $Domain --yes
vercel domains add "www.$Domain" --yes
vercel alias set $Project "www.$Domain" --yes

# Função para checar DNS
function Test-DNS {
    param([string]$d)
    try {
        $records = (Resolve-DnsName $d -Type CNAME -ErrorAction Stop).NameHost
        return $records -like "*vercel-dns.com"
    } catch {
        return $false
    }
}

$dnsOk = $false
for ($i=0; $i -lt 30; $i++) {
    if (Test-DNS "www.$Domain") {
        Write-Stamp "✅ DNS já aponta para Vercel."
        $dnsOk = $true
        break
    } else {
        Write-Stamp "⏳ Aguardando propagação DNS... (tentativa $($i+1)/30)"
        Start-Sleep -Seconds 30
    }
}
if (-not $dnsOk) {
    Write-Stamp "❌ DNS não propagou, verifique manualmente."
}

# 3️⃣ Monitoramento contínuo e alertas WhatsApp
function Check-Site {
    try {
        $req = Invoke-WebRequest "https://www.$Domain" -UseBasicParsing -TimeoutSec 10
        if ($req.StatusCode -eq 200) {
            Write-Stamp "✅ Site online."
            return $true
        }
    } catch {
        Write-Stamp "⚠️ Site offline. Enviando alerta WhatsApp..."
        Send-WhatsAppAlert "🚨 Alerta: O site PecuariaTech caiu!"
        return $false
    }
}

function Send-WhatsAppAlert($Message) {
    $Url = "https://graph.facebook.com/v17.0/$PhoneNumberId/messages"
    $Header = @{ "Authorization" = "Bearer $WhatsAppToken"; "Content-Type" = "application/json" }
    $Body = @{
        messaging_product = "whatsapp"
        to = $To
        type = "text"
        text = @{ body = $Message }
    } | ConvertTo-Json -Depth 3
    try {
        Invoke-RestMethod -Method Post -Uri $Url -Headers $Header -Body $Body
        Write-Stamp "✅ Mensagem enviada com sucesso!"
    } catch {
        Write-Stamp "❌ Falha ao enviar mensagem WhatsApp."
    }
}

# 4️⃣ Função GPS (exemplo já integrado)
function Start-GPSIntegration {
    Write-Stamp "📡 Integrando GPS em tempo real..."
    # Aqui você pode adicionar a lógica existente do seu GPS
    # Por exemplo, leitura de coordenadas do Supabase e atualização no mapa
}

# 5️⃣ Loop contínuo
Start-GPSIntegration
while ($true) {
    Check-Site
    Start-Sleep -Seconds 60
}
