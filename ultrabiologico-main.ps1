# ultrabiologico-main.ps1
# Projeto PecuariaTech - Pipeline ultrabiológico

param(
  [string]$ProjectPath = "C:\Users\Administrador\pecuariatech",
  [string]$SiteUrl = "https://www.pecuariatech.com",
  [string]$SupabaseUrl = "<SUA_URL_SUPABASE>",
  [string]$SupabaseKey = "<SUA_API_KEY_SUPABASE>",
  [string]$AccessToken = "<SEU_TOKEN_META>",
  [string]$PhoneNumberId = "<SEU_PHONE_NUMBER_ID>",
  [string]$To = "5567999564560"  # Seu número WhatsApp
)

function Write-Stamp($msg) {
  $ts = Get-Date -Format "HH:mm:ss"
  Write-Host "[$ts] $msg"
}

# 1. Atualizar dependências
Write-Stamp "📦 Atualizando dependências..."
cd $ProjectPath
npm install --force | Out-Null

# 2. Build do Next.js
Write-Stamp "🏗 Construindo aplicação..."
npm run build | Out-Null

# 3. Deploy no Vercel
Write-Stamp "🚀 Fazendo deploy no Vercel..."
vercel --prod --yes | Out-Null

# 4. Monitoramento de disponibilidade
function Test-Site {
  try {
    $resp = Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing -TimeoutSec 10
    return $resp.StatusCode -eq 200
  } catch { return $false }
}

# 5. Enviar alerta WhatsApp
function Send-WhatsApp($msg) {
  $url = "https://graph.facebook.com/v19.0/$PhoneNumberId/messages"
  $headers = @{ Authorization = "Bearer $AccessToken"; "Content-Type"="application/json" }
  $body = @{ messaging_product="whatsapp"; to=$To; type="text"; text=@{ body=$msg } } | ConvertTo-Json -Depth 3
  Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body $body | Out-Null
}

# 6. GPS → salvar no Supabase
function Save-GPS($lat,$lng) {
  $gpsData = @{ latitude=$lat; longitude=$lng; created_at=(Get-Date).ToString("o") } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$SupabaseUrl/rest/v1/gps" `
    -Headers @{ apikey=$SupabaseKey; Authorization="Bearer $SupabaseKey"; "Content-Type"="application/json" } `
    -Body $gpsData | Out-Null
  Write-Stamp "📍 GPS registrado: $lat,$lng"
}

# 7. Loop de monitoramento
while ($true) {
  if (Test-Site) {
    Write-Stamp "✅ Site online."
    # Exemplo: coordenadas fixas simuladas (substituir por integração real)
    Save-GPS -lat -20.4697 -lng -54.6201
  } else {
    Write-Stamp "❌ Site offline! Enviando alerta..."
    Send-WhatsApp "🚨 PecuariaTech fora do ar em $((Get-Date).ToString())"
  }
  Start-Sleep -Seconds 60
}
