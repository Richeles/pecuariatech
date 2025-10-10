# ultra-dashboard-fix-deploy.ps1
# Script único: corrige UTF-8, rebuild, deploy e teste de rotas

Write-Host "🔧 Iniciando UltraDashboard Fix & Deploy..." -ForegroundColor Green

# --- CONFIGURAÇÕES ---
$projectPath = "C:\Users\Administrador\pecuariatech"
$vercelCmd = "vercel"
$urls = @(
    "https://www.pecuariatech.com/dashboard",
    "https://www.pecuariatech.com/rebanho",
    "https://www.pecuariatech.com/pastagem",
    "https://www.pecuariatech.com/financeiro",
    "https://www.pecuariatech.com/ultrabiologica/status"
)

# --- FUNÇÃO: Converter arquivos para UTF-8 sem BOM ---
function Convert-ToUTF8 {
    Write-Host "`n🌐 Corrigindo codificação UTF-8..."
    $files = Get-ChildItem -Path "$projectPath\app" -Include *.tsx, *.css -Recurse
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw
        Set-Content -Path $file.FullName -Value $content -Encoding utf8
        Write-Host "✅ UTF-8 corrigido: $($file.FullName)"
    }
}

# --- FUNÇÃO: Limpar build antigo ---
function Clean-Build {
    Write-Host "`n🧹 Limpando build antigo..."
    $nextPath = Join-Path $projectPath ".next"
    if (Test-Path $nextPath) { Remove-Item $nextPath -Recurse -Force; Write-Host "✅ .next removido." }
    else { Write-Host "[INFO] .next não existe." }
}

# --- FUNÇÃO: Rebuild Next.js ---
function Rebuild-Next {
    Write-Host "`n⚡ Rebuild Next.js..."
    Set-Location $projectPath
    npm install
    npm run build
    Write-Host "✅ Build concluído."
}

# --- FUNÇÃO: Deploy forçado Vercel ---
function Deploy-Vercel {
    Write-Host "`n🚀 Deploy forçado no Vercel..."
    Set-Location $projectPath
    & $vercelCmd --prod --force
    Write-Host "✅ Deploy concluído."
}

# --- FUNÇÃO: Teste de rotas ---
function Test-Routes {
    Write-Host "`n🌐 Testando rotas..."
    foreach ($url in $urls) {
        try {
            $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
            if ($res.StatusCode -eq 200) { Write-Host "✅ $url [OK]" -ForegroundColor Green }
            else { Write-Host "⚠️ $url [Código: $($res.StatusCode)]" -ForegroundColor Yellow }
        } catch { Write-Host "❌ $url [Erro de acesso]" -ForegroundColor Red }
    }
}

# --- EXECUÇÃO ---
Write-Host "`n=== Iniciando UltraDashboard Fix & Deploy ===`"
Convert-ToUTF8
Clean-Build
Rebuild-Next
Deploy-Vercel
Test-Routes
Write-Host "`n🎉 UltraDashboard fix concluído com sucesso!" -ForegroundColor Green
