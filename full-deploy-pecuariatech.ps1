# full-deploy-pecuariatech.ps1
# 🚀 Script Inteligente de Deploy PecuariaTech
# Autor: Richeles + GPT-5
# Data: (gerado automaticamente)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logFile = "logs/deploy-report-$((Get-Date).ToString('yyyyMMdd-HHmm')).txt"
$baseDir = "C:\Users\Administrador\pecuariatech"

Write-Host "[$timestamp] [START] Iniciando Deploy Inteligente PecuariaTech..." -ForegroundColor Cyan
Set-Location $baseDir

# 1️⃣ Permissões
Set-ExecutionPolicy Bypass -Scope Process -Force
Unblock-File .\*.ps1 -ErrorAction SilentlyContinue

# 2️⃣ Conectividade
if (-not (Test-Connection vercel.com -Count 1 -Quiet)) {
    Write-Host "❌ Sem conexão com vercel.com" -ForegroundColor Red
    exit 1
}

# 3️⃣ Atualiza Vercel CLI
Write-Host "[INFO] Atualizando Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel@latest

# 4️⃣ Limpeza de caches
Write-Host "[INFO] Limpando caches antigos..." -ForegroundColor Yellow
Remove-Item -Recurse -Force ".next","node_modules\.cache",".vercel","logs" -ErrorAction SilentlyContinue
mkdir logs -ErrorAction SilentlyContinue

# 5️⃣ Reconversão UTF-8 sem BOM
Write-Host "[INFO] Corrigindo codificação UTF-8..." -ForegroundColor Yellow
$files = Get-ChildItem -Recurse -Include *.tsx,*.ts,*.js,*.json,*.css,*.html,*.md,*.env | 
         Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        $content | Set-Content $file.FullName -Encoding utf8
    } catch {
        Write-Host "⚠ Falha em $($file.FullName)"
    }
}

# 6️⃣ Corrige charset global
$layouts = Get-ChildItem -Recurse -Include layout.tsx,page.tsx | Where-Object { $_.FullName -notmatch "node_modules" }
foreach ($layout in $layouts) {
    $content = Get-Content $layout.FullName -Raw
    if ($content -notmatch "charSet") {
        $content = "<meta charSet='UTF-8' />`n" + $content
        $content | Set-Content $layout.FullName -Encoding utf8
        Write-Host "✅ Charset adicionado em $($layout.FullName)"
    }
}

# 7️⃣ Instala dependências limpas
Write-Host "[INFO] Reinstalando dependências..." -ForegroundColor Yellow
npm ci

# 8️⃣ Build e Deploy
Write-Host "[INFO] Executando build..." -ForegroundColor Yellow
npm run build

Write-Host "[INFO] Deployando para Vercel..." -ForegroundColor Yellow
vercel --prod --confirm --yes
vercel alias set pecuariatech www.pecuariatech.com

# 9️⃣ Registro
$vercelVersion = (vercel --version)
Add-Content $logFile "Deploy realizado em: $timestamp"
Add-Content $logFile "Vercel CLI: $vercelVersion"
Add-Content $logFile "Arquivos UTF-8 convertidos: $($files.Count)"
Add-Content $logFile "Domínio: https://www.pecuariatech.com"
Write-Host "✅ Deploy completo! Acesse: https://www.pecuariatech.com" -ForegroundColor Green
