# =====================================================================
#  UltraBiológica Cloud v5.5.2 — UTF-8 & Visual Deploy PecuariaTech
# =====================================================================
$projectPath = "C:\Users\Administrador\pecuariatech"
Set-Location $projectPath
$logDir = "$projectPath\logs"
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "$logDir\utf8-fix-$timestamp.html"

Write-Host "[INFO] Iniciando correção UTF-8 e deploy visual..." -ForegroundColor Cyan

# [1] Verificação básica
Write-Host "[1] Verificando ambiente..." -ForegroundColor Yellow
$tools = @("git", "node", "npm", "vercel")
foreach ($t in $tools) {
    if (-not (Get-Command $t -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Ferramenta ausente: $t" -ForegroundColor Red
        exit
    }
}
Write-Host "✅ Ambiente validado!" -ForegroundColor Green

# [2] Conversão UTF-8 sem BOM
Write-Host "[2] Corrigindo arquivos para UTF-8 sem BOM..." -ForegroundColor Yellow
$extensions = "*.ts","*.tsx","*.js","*.jsx","*.json","*.html","*.md"
$converted = @()

foreach ($ext in $extensions) {
    Get-ChildItem -Recurse -Filter $ext -File | ForEach-Object {
        $path = $_.FullName
        try {
            $content = Get-Content -Raw -Encoding Default -Path $path
            [IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
            $converted += $path
        } catch {
            Write-Host "⚠️ Erro ao converter: $path" -ForegroundColor DarkYellow
        }
    }
}
Write-Host "✅ Arquivos convertidos para UTF-8 sem BOM!" -ForegroundColor Green

# [3] Garantindo meta charset UTF-8
Write-Host "[3] Ajustando layout para meta UTF-8..." -ForegroundColor Yellow
$layoutFile = Join-Path $projectPath "app\layout.tsx"
if (Test-Path $layoutFile) {
    $layoutContent = Get-Content -Raw $layoutFile
    if ($layoutContent -notmatch '<meta charset="UTF-8"') {
        $layoutContent = $layoutContent -replace "(?i)<head>", "<head>`n    <meta charset=`"UTF-8`">"
        Set-Content -Path $layoutFile -Value $layoutContent -Encoding UTF8
        Write-Host "✅ meta UTF-8 adicionado ao layout.tsx"
    }
}

# [4] Build + Deploy Vercel
Write-Host "[4] Build do projeto..." -ForegroundColor Yellow
npm run build

Write-Host "[5] Deploy na Vercel..." -ForegroundColor Yellow
vercel --prod --yes | Tee-Object -FilePath "$logDir\vercel-$timestamp.txt"

# [6] Relatório HTML
$report = @"
<html><head><meta charset='UTF-8'><title>Relatório UTF-8 PecuariaTech</title></head>
<body style='font-family:Segoe UI;'>
<h2>🧬 UltraBiológica Cloud — Relatório de Correção UTF-8</h2>
<p><b>Data:</b> $(Get-Date)</p>
<h3>Arquivos convertidos:</h3>
<ul>
"@
foreach ($f in $converted) { $report += "<li>$f</li>" }
$report += "</ul></body></html>"
$report | Out-File -FilePath $logFile -Encoding UTF8

Write-Host ""
Write-Host "✅ Correção UTF-8 concluída e deploy realizado com sucesso!" -ForegroundColor Green
Write-Host "📄 Relatório: $logFile" -ForegroundColor Cyan
Write-Host "🚀 Acesse: https://www.pecuariatech.com" -ForegroundColor Yellow
