<# 
 UltraBiológica Cloud — PecuariaTech v5.3.9 
 Script: vercel-purge-redeploy.ps1
 Autor: Richeles Alves dos Santos 🧠⚡
 Função: Purga total, rebuild e redeploy automático com verificação UTF-8.
#>

$ErrorActionPreference = "Stop"
$Root = "C:\Users\Administrador\pecuariatech"
$LogDir = Join-Path $Root "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "vercel-purge-redeploy-$Date.log"
$Url = "https://www.pecuariatech.com/dashboard"

Write-Host "🧱 Iniciando reconstrução completa do PecuariaTech..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

# 1️⃣ Limpeza de caches locais e builds antigos
Write-Host "🧹 Limpando cache local, node_modules e builds antigos..." -ForegroundColor Yellow
@(".next", "node_modules", ".turbo", ".vercel") | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue }
}
npm cache clean --force | Out-Null

# 2️⃣ Reinstalação de dependências
Write-Host "📦 Reinstalando dependências..." -ForegroundColor Yellow
npm install | Tee-Object -FilePath $LogFile -Append

# 3️⃣ Build completo
Write-Host "⚙️ Compilando projeto Next.js..." -ForegroundColor Yellow
npm run build | Tee-Object -FilePath $LogFile -Append

# 4️⃣ Commit e envio para GitHub
Write-Host "🚀 Enviando para GitHub (forçando redeploy na Vercel)..." -ForegroundColor Yellow
git add -A
git commit --allow-empty -m "deploy: rebuild completo e purga de cache UTF-8 ($Date)" | Out-Null
git push origin main | Tee-Object -FilePath $LogFile -Append

# 5️⃣ Verificação UTF-8 pós-deploy
Write-Host "🌐 Verificando status de deploy e codificação UTF-8..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

try {
    Add-Type -AssemblyName System.Net.Http
    $handler = New-Object System.Net.Http.HttpClientHandler
    $handler.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
    $client = New-Object System.Net.Http.HttpClient($handler)
    $client.DefaultRequestHeaders.Add("User-Agent","PecuariaTech UTF8 Post-Deploy Checker")

    $response = $client.GetAsync($Url).Result
    $headers = $response.Content.Headers
    $html = $response.Content.ReadAsStringAsync().Result
    $charset = "não detectado"

    if ($headers.Contains("Content-Type")) {
        $contentType = $headers.GetValues("Content-Type")
        if ($contentType -match "charset\s*=\s*([^\s;]+)") {
            $charset = $Matches[1]
        }
    }

    Write-Host "`n📋 Content-Type: $contentType" -ForegroundColor Gray
    Write-Host "🔍 Charset detectado: $charset" -ForegroundColor Yellow

    if ($charset -match "utf-8") {
        Write-Host "✅ Site servindo UTF-8 corretamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Charset incorreto detectado: $charset" -ForegroundColor Red
    }

    $report = @"
Relatório de Deploy PecuariaTech — $(Get-Date)
URL: $Url
Charset: $charset
Status HTTP: $($response.StatusCode)
------------------------------------------------
Trecho inicial do HTML:
$($html.Substring(0,[Math]::Min($html.Length,400)))
------------------------------------------------
"@
    $report | Out-File -FilePath $LogFile -Encoding UTF8
    Write-Host "`n💾 Log completo salvo em: $LogFile" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erro durante verificação pós-deploy: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ Finalizado! Aguarde o build da Vercel (~2–5min) e depois abra:" -ForegroundColor Green
Write-Host "👉 https://www.pecuariatech.com/dashboard" -ForegroundColor Yellow

Add-Type -AssemblyName PresentationCore,PresentationFramework
[System.Media.SystemSounds]::Asterisk.Play()
