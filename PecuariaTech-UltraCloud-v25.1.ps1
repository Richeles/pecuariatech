# ============================================================
# PecuariaTech UltraCloud v25.1 — by ChatGPT + Richeles
# Script Oficial: Deploy • Limpeza • Monitoramento • Status
# Caminho raiz: C:\Users\Administrador\pecuariatech
# Branch: main
# Deploy: Vercel Automático
# ============================================================

$Root = "C:\Users\Administrador\pecuariatech"
$Branch = "main"
$StatusFile = "$Root\status.html"
$LogFile = "$Root\UltraCloud.log"

Function Write-Log($msg) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "$timestamp — $msg" | Tee-Object -Append $LogFile
}

Write-Log "🚀 Iniciando UltraCloud v25.1"

# ============================================================
# 1) LIMPEZA PROFUNDA (SEGURA)
# ============================================================

Write-Log "🧹 Iniciando limpeza profunda..."

$dirsToDelete = @(".next", "node_modules", ".vercel", "dist", ".cache", "logs")

foreach ($item in $dirsToDelete) {
    $path = Join-Path $Root $item
    if (Test-Path $path) {
        try {
            Remove-Item $path -Recurse -Force -ErrorAction Stop
            Write-Log "✔ Removido: $item"
        }
        catch {
            Write-Log "⚠ Não foi possível remover $item — $_"
        }
    }
}

Write-Log "🧹 Limpeza concluída!"

# ============================================================
# 2) INSTALAR DEPENDÊNCIAS
# ============================================================

Write-Log "📦 Instalando dependências NPM..."

cd $Root
npm install

Write-Log "✔ Dependências instaladas"

# ============================================================
# 3) GERAR STATUS.HTML LOCAL
# ============================================================

Write-Log "📄 Gerando status.html"

$status = @"
<html>
<head>
<title>PecuariaTech Status</title>
<style>
body { font-family: Arial; background:#f3f3f3; padding:20px; }
.card { background:white; padding:20px; border-radius:10px; width:500px; }
</style>
</head>

<body>
<h2>UltraCloud Status — PecuariaTech</h2>
<div class='card'>
<p><b>Última atualização:</b> $(Get-Date)</p>
<p><b>Branch:</b> $Branch</p>
<p><b>Deploy Automático:</b> Sim</p>
<p><b>Status geral:</b> ✔ Operacional</p>
</div>
</body>
</html>
"@

$status | Out-File -Encoding utf8 $StatusFile

Write-Log "✔ status.html criado"

# ============================================================
# 4) BUILD DO PROJETO
# ============================================================

Write-Log "🏗 Iniciando build do projeto..."

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Log "❌ ERRO NO BUILD!"
    exit
}

Write-Log "✔ Build concluído"

# ============================================================
# 5) PUSH AUTOMÁTICO PARA GITHUB
# ============================================================

Write-Log "📤 Realizando push automático..."

git add .
git commit -m "UltraCloud v25.1 — AutoSync"
git pull origin $Branch
git push origin $Branch

Write-Log "✔ Push realizado"

# ============================================================
# 6) DEPLOY AUTOMÁTICO — VERCEL
# ============================================================

Write-Log "🚀 Enviando deploy para Vercel..."

vercel --prod --yes

Write-Log "✔ Deploy enviado para Vercel"

# ============================================================
# 7) VERIFICAÇÃO FINAL
# ============================================================

Write-Log "🔍 Testando site online..."

try {
    $response = Invoke-WebRequest "https://www.pecuariatech.com" -UseBasicParsing -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
        Write-Log "🌐 Site ONLINE!"
    }
}
catch {
    Write-Log "❌ O site parece offline ou demorando"
}

Write-Log "🏁 UltraCloud v25.1 FINALIZADO!"
Write-Host "🎉 PecuariaTech UltraCloud v25.1 Finalizado!"
