# ============================================================
# 🧠 PecuariaTech — UltraBiológica Cloud v6
# fly-pecuariatech-visual-v6.ps1
# Sincroniza GitHub + Corrige UTF-8 + Deploy Visual na Vercel
# ============================================================

param (
    [string]$projectPath = "C:\Users\Administrador\pecuariatech",
    [string]$logDir = "C:\Users\Administrador\pecuariatech\logs"
)

# ---------- Funções ----------
function Write-Log($msg) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "$timestamp | $msg"
    Add-Content -Path "$logDir\fly-visual-v6.log" -Value "$timestamp | $msg"
}

# ---------- Início ----------
Write-Host "`n[INFO] Iniciando UltraBiológica Cloud Visual v6..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Write-Log "Iniciando deploy visual..."

# ---------- 1. Validação ----------
Write-Host "[1] Validando ambiente..." -ForegroundColor Yellow
$tools = @("git", "npm", "vercel", "node")
foreach ($tool in $tools) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Ferramenta ausente: $tool" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Ambiente validado!" -ForegroundColor Green
Write-Log "Ambiente validado."

# ---------- 2. Limpeza de diretórios ----------
Write-Host "[2] Limpando diretórios antigos..." -ForegroundColor Yellow
$paths = @(".next", ".vercel", ".cache", "dist")
foreach ($p in $paths) {
    $fullPath = Join-Path $projectPath $p
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Log "Removido: $p"
    }
}
Write-Host "✅ Diretórios limpos!" -ForegroundColor Green

# ---------- 3. Correção UTF-8 ----------
Write-Host "[3] Corrigindo arquivos UTF-8..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $projectPath -Include *.js,*.ts,*.tsx,*.html,*.css,*.json -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "node_modules|.next|.vercel" }

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        [IO.File]::WriteAllText($file.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
    } catch {
        Write-Log "Ignorado: $($file.FullName)"
    }
}
Write-Host "✅ Arquivos convertidos para UTF-8 sem BOM!" -ForegroundColor Green
Write-Log "UTF-8 concluído."

# ---------- 4. Ajuste HTML ----------
Write-Host "[4] Garantindo meta charset UTF-8..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $projectPath -Include *.html -Recurse -ErrorAction SilentlyContinue
foreach ($html in $htmlFiles) {
    (Get-Content $html.FullName) -replace '(?i)<meta charset=.*?>', '<meta charset="UTF-8">' |
        Set-Content -Encoding UTF8 $html.FullName
}
Write-Host "✅ Meta charset ajustado!" -ForegroundColor Green

# ---------- 5. Build ----------
Write-Host "[5] Gerando build do Next.js..." -ForegroundColor Yellow
Set-Location $projectPath
npm install --force | Out-Null
npm run build
Write-Log "Build concluído com sucesso."

# ---------- 6. GitHub Sync ----------
Write-Host "[6] Sincronizando repositório GitHub..." -ForegroundColor Yellow
git add -A
git commit -m "Deploy visual automático v6 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-Null
git push origin main
Write-Host "✅ Código enviado ao GitHub!" -ForegroundColor Green
Write-Log "Commit e push concluídos."

# ---------- 7. Deploy Vercel ----------
Write-Host "[7] Publicando na Vercel..." -ForegroundColor Yellow
vercel --prod --yes
$vercelUrl = (vercel --prod --yes | Select-String -Pattern "https://.*\.vercel\.app" | Select-Object -First 1).Matches.Value
Write-Host "✅ Deploy concluído: $vercelUrl" -ForegroundColor Green
Write-Log "Deploy publicado: $vercelUrl"

# ---------- 8. Alias domínio ----------
Write-Host "[8] Atualizando domínio www.pecuariatech.com..." -ForegroundColor Yellow
vercel alias set $vercelUrl www.pecuariatech.com --yes
Write-Host "✅ Domínio atualizado com sucesso!" -ForegroundColor Green
Write-Log "Domínio sincronizado."

# ---------- 9. Finalização ----------
$logHtml = "$logDir\fly-visual-v6.html"
$report = @"
<html><body style='font-family:Segoe UI'>
<h2>Relatório de Deploy — PecuariaTech v6</h2>
<p><b>Status:</b> Concluído com sucesso!</p>
<p><b>Build:</b> $(Get-Date)</p>
<p><b>Deploy:</b> <a href='$vercelUrl'>$vercelUrl</a></p>
<p><b>Domínio:</b> <a href='https://www.pecuariatech.com'>www.pecuariatech.com</a></p>
</body></html>
"@
$report | Out-File -Encoding UTF8 $logHtml

Write-Host "`n🚀 PecuariaTech Visual v6 concluído com sucesso!"
Write-Host "📄 Relatório salvo em: $logHtml"
Write-Host "🌐 Acesse: https://www.pecuariatech.com"
