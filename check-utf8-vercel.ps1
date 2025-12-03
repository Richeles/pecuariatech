<# PecuariaTech UTF-8 Diagnóstico v5.3.7 — Fallback Gzip/HTTPClient #>

$ErrorActionPreference = 'Stop'
$Root = "C:\Users\Administrador\pecuariatech"
$LogDir = Join-Path $Root "logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$Url = "https://www.pecuariatech.com/dashboard"
$LogFile = Join-Path $LogDir ("http-charset-check-" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".log")

Write-Host "🌐 Testando cabeçalhos HTTP de $Url ..." -ForegroundColor Cyan

try {
    # Usa HttpClient moderno para contornar limitações do Invoke-WebRequest
    Add-Type -AssemblyName System.Net.Http
    $handler = New-Object System.Net.Http.HttpClientHandler
    $handler.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
    $client = New-Object System.Net.Http.HttpClient($handler)
    $client.DefaultRequestHeaders.Add("User-Agent","PecuariaTech UTF8 Diagnostic")
    $client.DefaultRequestHeaders.Add("Cache-Control","no-cache")

    $response = $client.GetAsync($Url).Result
    $headers = $response.Content.Headers
    $rawHtml = $response.Content.ReadAsStringAsync().Result
    $contentType = if ($headers.Contains("Content-Type")) { $headers.GetValues("Content-Type") } else { "não especificado" }

    $charset = "não especificado"
    if ($contentType -match "charset\s*=\s*([^\s;]+)") {
        $charset = $Matches[1]
    }

    Write-Host "`n📋 Cabeçalhos recebidos:" -ForegroundColor Yellow
    Write-Host "Content-Type: $contentType" -ForegroundColor Gray
    Write-Host "`n🔍 Charset detectado: $charset`n" -ForegroundColor Yellow

    $status = "✅ UTF-8 correto"
    if ($charset -notmatch "utf-8") {
        Write-Host "⚠️ Atenção: O servidor não está enviando UTF-8! ($charset)" -ForegroundColor Red
        $status = "❌ Charset incorreto: $charset"
    } else {
        Write-Host "✅ O servidor está servindo UTF-8 corretamente." -ForegroundColor Green
    }

    if ($rawHtml -match "<meta\s+charset\s*=\s*['""]?utf-8['""]?") {
        Write-Host "✅ Meta charset UTF-8 presente no HTML." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Meta charset não encontrado no HTML." -ForegroundColor DarkYellow
        $status += " | meta ausente"
    }

    $report = @"
Relatório de Diagnóstico UTF-8 — PecuariaTech
Data/Hora: $(Get-Date)
URL: $Url
------------------------------------------------
Content-Type recebido: $contentType
Charset detectado: $charset
Status: $status
------------------------------------------------
Trecho do conteúdo HTML:
$($rawHtml.Substring(0,[Math]::Min($rawHtml.Length,500)))
------------------------------------------------
"@
    $report | Out-File -FilePath $LogFile -Encoding UTF8
    Write-Host "`n💾 Relatório salvo em: $LogFile" -ForegroundColor Cyan

    Add-Type -AssemblyName PresentationCore,PresentationFramework
    [System.Media.SystemSounds]::Asterisk.Play()
    Start-Sleep -Seconds 2
    notepad $LogFile
}
catch {
    $errMsg = $_.Exception.Message
    Write-Host "❌ Erro ao acessar $Url : $errMsg" -ForegroundColor Red
}
