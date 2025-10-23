<# 
 UltraBiológica Cloud — PecuariaTech v5.4
 Script: vercel-autodeploy-telegram.ps1
 Autor: Richeles Alves dos Santos ⚙️🚀
 Função: Rebuild + deploy + monitoramento via Telegram
#>

$ErrorActionPreference = "Stop"
$Root = "C:\Users\Administrador\pecuariatech"
$LogDir = Join-Path $Root "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

# CONFIGURAÇÕES TELEGRAM — personalize aqui:
$BotToken = "SEU_TOKEN_AQUI"    # ex: 1234567890:ABCxyzXYZ
$ChatID   = "SEU_CHATID_AQUI"   # ex: 987654321

$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$Url = "https://www.pecuariatech.com/dashboard"
$LogFile = Join-Path $LogDir "vercel-autodeploy-$Date.log"

function Send-Telegram($msg) {
    try {
        $encoded = [System.Web.HttpUtility]::UrlEncode($msg)
        $uri = "https://api.telegram.org/bot$BotToken/sendMessage?chat_id=$ChatID&text=$encoded"
        Invoke-WebRequest -Uri $uri -UseBasicParsing | Out-Null
    } catch {
        Write-Host "⚠️ Falha ao enviar notificação Telegram: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "🚀 Iniciando pipeline autônoma do PecuariaTech..." -ForegroundColor Cyan
Send-Telegram "🚀 Iniciando rebuild e deploy automático do PecuariaTech (v5.4)..."

# 1️⃣ LIMPEZA COMPLETA
Write-Host "🧹 Limpando cache local e build..." -ForegroundColor Yellow
@(".next", "node_modules", ".turbo", ".vercel") | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue }
}
npm cache clean --force | Out-Null

# 2️⃣ REINSTALAÇÃO
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install | Tee-Object -FilePath $LogFile -Append

# 3️⃣ BUILD COMPLETO
Write-Host "⚙️ Compilando projeto Next.js..." -ForegroundColor Yellow
npm run build | Tee-Object -FilePath $LogFile -Append

# 4️⃣ DEPLOY (via GitHub)
Write-Host "☁️ Enviando para GitHub (forçando deploy na Vercel)..." -ForegroundColor Yellow
git add -A
git commit --allow-empty -m "deploy: auto rebuild completo UTF-8 ($Date)" | Out-Null
git push origin main | Tee-Object -FilePath $LogFile -Append

# 5️⃣ VERIFICAÇÃO PÓS-DEPLOY
Start-Sleep -Seconds 10
Write-Host "🌐 Verificando status do site..." -ForegroundColor Cyan

try {
    Add-Type -AssemblyName System.Net.Http
    $client = [System.Net.Http.HttpClient]::new()
    $response = $client.GetAsync($Url).Result
    $html = $response.Content.ReadAsStringAsync().Result
    $contentType = $response.Content.Headers.ContentType.ToString()
    $charset = if ($contentType -match "charset\s*=\s*([^\s;]+)") { $Matches[1] } else { "desconhecido" }

    if ($charset -match "utf-8") {
        Write-Host "✅ UTF-8 detectado corretamente!" -ForegroundColor Green
        $msg = "✅ Deploy concluído com sucesso! Site online em UTF-8 🌍
$Url
Build finalizado em $(Get-Date)"
    } else {
        Write-Host "⚠️ Charset incorreto detectado: $charset" -ForegroundColor Red
        $msg = "⚠️ Deploy concluído, mas charset incorreto detectado: $charset"
    }

    Send-Telegram $msg

    $report = @"
Relatório de Deploy PecuariaTech
Data/Hora: $(Get-Date)
URL: $Url
Content-Type: $contentType
Charset: $charset
------------------------------------------------
Trecho inicial do HTML:
$($html.Substring(0,[Math]::Min($html.Length,400)))
------------------------------------------------
"@
    $report | Out-File -FilePath $LogFile -Encoding UTF8
    Write-Host "`n💾 Log salvo em: $LogFile" -ForegroundColor Cyan
}
catch {
    $err = $_.Exception.Message
    Write-Host "❌ Erro durante verificação pós-deploy: $err" -ForegroundColor Red
    Send-Telegram "❌ Erro na verificação pós-deploy: $err"
}

Write-Host "`n✨ Processo concluído. Aguarde o build na Vercel (~5 min) e acesse:" -ForegroundColor Green
Write-Host "👉 $Url" -ForegroundColor Yellow
Send-Telegram "✨ Processo finalizado! Acesse o painel: $Url"
