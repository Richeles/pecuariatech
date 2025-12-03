<# 
 UltraBiológica Cloud — PecuariaTech v5.5
 Autor: Richeles Alves dos Santos ⚙️🚀
 Função: Remover BOM + rebuild + deploy + verificação + notificação via Telegram
 Compatível com PowerShell 7+
#>

$ErrorActionPreference = "Stop"
$Root = "C:\Users\Administrador\pecuariatech"
$LogDir = Join-Path $Root "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

# 🔧 CONFIGURAÇÕES TELEGRAM
$BotToken = "SEU_TOKEN_AQUI"    # Exemplo: 1234567890:ABCxyzXYZ
$ChatID   = "SEU_CHATID_AQUI"   # Exemplo: 987654321

$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$Url = "https://www.pecuariatech.com/dashboard"
$DeployLog = Join-Path $LogDir "vercel-autodeploy-$Date.log"
$FixBOMLog = Join-Path $LogDir "fix-bom-$Date.log"

function Send-Telegram($msg) {
    try {
        $encoded = [System.Web.HttpUtility]::UrlEncode($msg)
        $uri = "https://api.telegram.org/bot$BotToken/sendMessage?chat_id=$ChatID&text=$encoded"
        Invoke-WebRequest -Uri $uri -UseBasicParsing | Out-Null
    } catch {
        Write-Host "⚠️ Falha ao enviar notificação Telegram: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "🚀 Iniciando pipeline autônoma do PecuariaTech Cloud v5.5..." -ForegroundColor Cyan
Send-Telegram "🚀 Iniciando deploy automático do PecuariaTech Cloud v5.5..."

# 🧹 LIMPEZA DE BOM (Byte Order Mark)
Write-Host "`n🧩 Verificando arquivos com BOM..." -ForegroundColor Yellow
$exts = "*.ts","*.tsx","*.js","*.jsx","*.json","*.html","*.css"
$Count = 0
Get-ChildItem -Path $Root -Include $exts -Recurse -File | ForEach-Object {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $clean = $bytes[3..($bytes.Length - 1)]
            [System.IO.File]::WriteAllBytes($_.FullName, $clean)
            Write-Host "✔️ BOM removido: $($_.FullName)" -ForegroundColor Green
            "Removido BOM -> $($_.FullName)" | Out-File -FilePath $FixBOMLog -Append -Encoding UTF8
            $Count++
        }
    } catch {
        Write-Host "⚠️ Erro ao processar $($_.FullName): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
if ($Count -eq 0) {
    Write-Host "✅ Nenhum arquivo com BOM encontrado." -ForegroundColor Yellow
} else {
    Write-Host "💾 Log de correção salvo em: $FixBOMLog" -ForegroundColor Cyan
    Write-Host "🧩 Total de arquivos corrigidos: $Count" -ForegroundColor Green
}

# 🧼 LIMPEZA DE BUILD
Write-Host "`n🧹 Limpando cache local e build..." -ForegroundColor Yellow
@(".next", ".vercel", ".turbo", "node_modules") | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue }
}
npm cache clean --force | Out-Null

# 📦 REINSTALAÇÃO
Write-Host "`n📦 Instalando dependências..." -ForegroundColor Yellow
npm install | Tee-Object -FilePath $DeployLog -Append

# ⚙️ COMPILAÇÃO
Write-Host "`n⚙️ Compilando projeto Next.js..." -ForegroundColor Yellow
npm run build | Tee-Object -FilePath $DeployLog -Append

# ☁️ DEPLOY VIA GITHUB
Write-Host "`n☁️ Enviando para GitHub (forçando deploy na Vercel)..." -ForegroundColor Yellow
git add -A
git commit --allow-empty -m "deploy: auto rebuild UTF-8 + BOM fix ($Date)" | Out-Null
git push origin main | Tee-Object -FilePath $DeployLog -Append

# 🌐 VERIFICAÇÃO ONLINE
Start-Sleep -Seconds 10
Write-Host "`n🌍 Verificando status online..." -ForegroundColor Cyan
try {
    Add-Type -AssemblyName System.Net.Http
    $client = [System.Net.Http.HttpClient]::new()
    $response = $client.GetAsync($Url).Result
    $html = $response.Content.ReadAsStringAsync().Result
    $contentType = $response.Content.Headers.ContentType.ToString()
    $charset = if ($contentType -match "charset\s*=\s*([^\s;]+)") { $Matches[1] } else { "desconhecido" }

    if ($charset -match "utf-8") {
        Write-Host "✅ UTF-8 detectado corretamente!" -ForegroundColor Green
        $msg = "✅ Deploy concluído com sucesso! 🌍
PecuariaTech está online e íntegro.
URL: $Url
Build: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
    } else {
        Write-Host "⚠️ Charset incorreto detectado: $charset" -ForegroundColor Red
        $msg = "⚠️ Deploy concluído, mas charset incorreto: $charset"
    }

    Send-Telegram $msg

    $report = @"
Relatório de Deploy PecuariaTech
Data/Hora: $(Get-Date)
URL: $Url
Content-Type: $contentType
Charset: $charset
-------------------------------------------
Trecho inicial do HTML:
$($html.Substring(0,[Math]::Min($html.Length,400)))
-------------------------------------------
"@
    $report | Out-File -FilePath $DeployLog -Encoding UTF8
    Write-Host "`n💾 Log salvo em: $DeployLog" -ForegroundColor Cyan
}
catch {
    $err = $_.Exception.Message
    Write-Host "❌ Erro durante verificação pós-deploy: $err" -ForegroundColor Red
    Send-Telegram "❌ Erro pós-deploy: $err"
}

Write-Host "`n✨ Processo concluído! Acesse o site em alguns minutos:" -ForegroundColor Green
Write-Host "👉 $Url" -ForegroundColor Yellow
Send-Telegram "✨ Deploy finalizado! Acesse o painel: $Url"
