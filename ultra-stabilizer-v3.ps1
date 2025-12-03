<#
 🌎 Ultra Stabilizer v3 — PecuariaTech Cloud
 🔧 Modo Turbo Multithread com correção automática de UTF-8 e build
#>

Write-Host "🌎 Ultra Stabilizer v3 — PecuariaTech Cloud" -ForegroundColor Cyan
$projectRoot = "C:\Users\Administrador\pecuariatech"
$logPath = Join-Path $projectRoot "logs\stabilizer-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

if (!(Test-Path (Split-Path $logPath))) { New-Item -ItemType Directory -Path (Split-Path $logPath) | Out-Null }

Write-Host "🧠 Limpando caches e preparando ambiente..."
Remove-Item -Recurse -Force "$projectRoot\.next","$projectRoot\node_modules\.cache" -ErrorAction SilentlyContinue | Out-Null

# Definir mapeamento de correções de caracteres
$utfMap = @{
    'ÃƒÂ' = 'ã'; 'Ã¢â‚¬' = '-'; 'Â' = ''; 'Ã§' = 'ç'; 'Ã³' = 'ó'; 'Ã­' = 'í';
    'Ã©' = 'é'; 'Ã¡' = 'á'; 'Ãª' = 'ê'; 'Ã£' = 'ã'; 'Ãµ' = 'õ'; 'Ãº' = 'ú';
}

Write-Host "⚙️ Iniciando correção paralela de arquivos..." -ForegroundColor Yellow

$files = Get-ChildItem -Path $projectRoot -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.json,*.ps1 `
    -Exclude node_modules,.next,.git,logs,dist,build,.vercel `
    -ErrorAction SilentlyContinue

$total = $files.Count
Write-Host "📂 Total de arquivos analisados: $total"

$ProgressPreference = 'SilentlyContinue'

$files | ForEach-Object -Parallel {
    param($utfMap, $logPath)
    try {
        $content = Get-Content -Path $_.FullName -Raw -ErrorAction Stop
        foreach ($key in $utfMap.Keys) {
            $content = $content -replace [regex]::Escape($key), $utfMap[$key]
        }
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8
        Add-Content -Path $logPath -Value "✔️ Corrigido: $($_.FullName)"
    } catch {
        Add-Content -Path $logPath -Value "⚠️ Falha: $($_.FullName) — $($_.Exception.Message)"
    }
} -ThrottleLimit 8 -ArgumentList $utfMap, $logPath

Write-Host "✅ Correções de UTF-8 finalizadas!"
Write-Host "📜 Log completo salvo em: $logPath"

# Corrigir next.config.js automaticamente
$nextConfig = Join-Path $projectRoot "next.config.js"
if (Test-Path $nextConfig) {
    Write-Host "🧩 Verificando next.config.js..."
    $text = Get-Content -Path $nextConfig -Raw
    $text = $text -replace "experimental:\s*true", "experimental: { serverActions: { bodySizeLimit: '2mb' } }"
    if ($text -notmatch '"type"') {
        $text = "{`n  `"type`": `"module`",`n" + $text
    }
    Set-Content -Path $nextConfig -Value $text -Encoding UTF8
    Write-Host "✅ next.config.js corrigido."
}

Write-Host "🧹 Limpando cache e iniciando build..." -ForegroundColor DarkYellow
npm run build | Tee-Object -FilePath $logPath -Append

Write-Host "🚀 PecuariaTech estabilizado e otimizado!" -ForegroundColor Green
