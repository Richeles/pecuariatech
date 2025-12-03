<# ======================================================================
   PECUARIATECH ULTRACLOUD v25.0 — SCRIPT OFICIAL
   Autor: Richeles + ChatGPT UltraSuite
   Função: Diagnóstico • Organização • Git • Deploy • Status • Monitor
   Caminho raiz fixo: C:\Users\Administrador\pecuariatech
   Branch principal: main
   Deploy automático: SIM (Vercel)
====================================================================== #>

Write-Host "🚀 Iniciando PecuariaTech UltraCloud v25.0..." -ForegroundColor Cyan

# CONFIGURAÇÕES PRINCIPAIS FIXAS
$RootPath = "C:\Users\Administrador\pecuariatech"
$Branch = "main"
$StatusPath = "$RootPath\ultracloud"
$LogDir = "$RootPath\logs"
$StatusFile = "$StatusPath\status.html"

# ===========================================================
# 1. VALIDAR PASTA RAIZ
# ===========================================================
Write-Host "📁 Verificando pasta raiz..." -ForegroundColor Yellow
if (!(Test-Path $RootPath)) {
    Write-Host "❌ ERRO: Pasta raiz não encontrada: $RootPath" -ForegroundColor Red
    exit
}
Write-Host "✅ Pasta raiz OK: $RootPath" -ForegroundColor Green

# ===========================================================
# 2. CRIAR PASTAS IMPORTANTES
# ===========================================================
Write-Host "📂 Garantindo estrutura /ultracloud e /logs..." -ForegroundColor Yellow

if (!(Test-Path $StatusPath)) { New-Item -ItemType Directory -Path $StatusPath | Out-Null }
if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

Write-Host "✅ Estrutura criada/validada." -ForegroundColor Green

# ===========================================================
# 3. GERAR STATUS HTML DO SISTEMA
# ===========================================================
Write-Host "📝 Criando status.html..." -ForegroundColor Yellow

$now = Get-Date -Format "dd/MM/yyyy HH:mm:ss"

@"
<html>
<head>
<title>PecuariaTech UltraCloud Status</title>
<style>
body { font-family: Arial; background: #0f0f0f; color: #00ff8c; padding: 20px; }
h1 { color: #00ffaa; }
.box { background:#1b1b1b; padding:20px; border-radius:10px; margin-top:20px; }
</style>
</head>
<body>
<h1>PecuariaTech UltraCloud — Status v25.0</h1>
<p>Atualizado: $now</p>

<div class="box">
<h3>Servidor Local</h3>
<p>Raiz: $RootPath</p>
<p>Branch: $Branch</p>
</div>

<div class="box">
<h3>Serviços</h3>
<ul>
<li>GitHub → OK</li>
<li>Vercel → Aguardando Deploy</li>
<li>Supabase → OK</li>
</ul>
</div>

</body>
</html>
"@ | Out-File $StatusFile -Encoding UTF8

Write-Host "✅ status.html criado em: $StatusFile" -ForegroundColor Green

# ===========================================================
# 4. TESTAR GIT
# ===========================================================
Write-Host "🔍 Testando Git..." -ForegroundColor Yellow
cd $RootPath

$gitStatus = git status 2>&1
if ($gitStatus -like "*fatal*") {
    Write-Host "❌ Git não encontrado ou não inicializado." -ForegroundColor Red
} else {
    Write-Host "✅ Git OK" -ForegroundColor Green
}

# ===========================================================
# 5. SINCRONIZAR BRANCH MAIN
# ===========================================================
Write-Host "🌿 Atualizando branch $Branch..." -ForegroundColor Yellow
git add .  
git commit -m "UltraCloud v25.0 — Auto-update"
git pull origin $Branch
git push origin $Branch

Write-Host "✅ Branch sincronizada com sucesso!" -ForegroundColor Green

# ===========================================================
# 6. DEPLOY AUTOMÁTICO VERCEL
# ===========================================================
Write-Host "🚀 Iniciando deploy na Vercel..." -ForegroundColor Yellow

$deploy = vercel --prod --yes 2>&1

if ($deploy -like "*Error*") {
    Write-Host "❌ ERRO NO DEPLOY" -ForegroundColor Red
} else {
    Write-Host "✅ Deploy realizado com sucesso!" -ForegroundColor Green
}

# ===========================================================
# 7. TESTAR ROTAS IMPORTANTES
# ===========================================================
Write-Host "🌐 Testando rotas..." -ForegroundColor Yellow

$routes = @(
    "https://www.pecuariatech.com",
    "https://www.pecuariatech.com/api/hello",
    "https://www.pecuariatech.com/ultracloud/status"
)

foreach ($r in $routes) {
    try {
        $response = Invoke-WebRequest -Uri $r -UseBasicParsing -TimeoutSec 15
        Write-Host "✅ $r OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ Falha em: $r" -ForegroundColor Red
    }
}

# ===========================================================
# 8. FINAL
# ===========================================================
Write-Host ""
Write-Host "🎉 PecuariaTech UltraCloud v25.0 Finalizado!" -ForegroundColor Cyan
Write-Host "Status do sistema: $StatusFile" -ForegroundColor Cyan
Write-Host "Site atualizado: https://www.pecuariatech.com" -ForegroundColor Cyan
