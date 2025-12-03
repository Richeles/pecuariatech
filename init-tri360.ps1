Write-Host "🚀 Iniciando módulo de inicialização Tri360..." -ForegroundColor Cyan

# Caminho base
$tri360Adaptive = "C:\Users\Administrador\pecuariatech\instalar-reparar-supabase-tri360-adaptive.ps1"
$logFile = "C:\Users\Administrador\pecuariatech\tri360_init_log.txt"

# Verifica se o log principal existe
if (-not (Test-Path "C:\Users\Administrador\pecuariatech\tri360_secure_log.txt")) {
    Write-Host "⚠️ Log principal não encontrado. Executando Tri360-Adaptive..." -ForegroundColor Yellow
    & $tri360Adaptive
} else {
    Write-Host "✅ Log principal encontrado. Ambiente estável." -ForegroundColor Green
}

# Verifica a conectividade com Supabase (teste rápido)
Write-Host "🌐 Verificando conexão com Supabase..."
try {
    $output = psql "postgresql://postgres:36%40Artropodes@db.kpzzekflqpoeccnqfkng.supabase.co:5432/postgres" -c "SELECT current_database();" 2>&1
    if ($output -match "postgres") {
        Write-Host "✅ Conexão Supabase OK."
        Add-Content $logFile "[$(Get-Date)] Boot OK — Supabase ativo."
    } else {
        Write-Host "❌ Falha de conexão. Chamando Tri360-Adaptive para reparo..." -ForegroundColor Red
        & $tri360Adaptive
    }
}
catch {
    Write-Host "❌ Erro crítico ao conectar ao Supabase. Executando Tri360-Adaptive..." -ForegroundColor Red
    & $tri360Adaptive
}

# Log final
Add-Content $logFile "[$(Get-Date)] Inicialização concluída com sucesso."
Write-Host "🧾 Log de inicialização salvo em: $logFile" -ForegroundColor Yellow
Write-Host "🔺 Sistema Triangular 360° — Boot concluído." -ForegroundColor Cyan
