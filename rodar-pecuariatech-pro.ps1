Write-Host "🔰 INICIANDO ULTRARUN 360º PRO — PECUARIATECH" -ForegroundColor Cyan
Start-Sleep -Seconds 1

# ================================================
# 1) VARIÁVEIS DO SUPABASE (RECOMENDADO PELO RICHELES)
# ================================================
Write-Host "🔧 Configurando variáveis reais do Supabase..." -ForegroundColor Yellow

$env:SUPABASE_URL="https://kpzjekflqpoeccnqfkng.supabase.co"
$env:SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDcxNTIsImV4cCI6MjA2NjM4MzE1Mn0.0QL2lRFVTXTr_2DFV0dywfElLzXirgFvx0qZRWPZUSQ"
$env:SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"
$env:SUPABASE_PUBLISHABLE_KEY="sb_publishable_24L7SRlrwKIXoNXMgg-QIQ_DbgOZTmg"

Write-Host "✅ Variáveis reais aplicadas." -ForegroundColor Green
Start-Sleep -Seconds 1


# ================================================
# 2) TESTE COMPLETO DO SUPABASE
# ================================================
Write-Host "🧪 Testando conexão com Supabase..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$env:SUPABASE_URL/rest/v1/" -Headers @{apikey=$env:SUPABASE_ANON_KEY} -Method GET -UseBasicParsing -TimeoutSec 6
    Write-Host "🟢 Supabase ONLINE e respondendo." -ForegroundColor Green
}
catch {
    Write-Host "🔴 ERRO: Supabase fora do ar ou chave inválida!" -ForegroundColor Red
    exit
}

Start-Sleep -Seconds 1


# ================================================
# 3) TESTE DAS TABELAS ESSENCIAIS
# ================================================
$tabelas = @("rebanho","pastagem","financeiro")

foreach ($t in $tabelas) {
    Write-Host "🔍 Verificando tabela: $t..."
    try {
        Invoke-WebRequest -Uri "$env:SUPABASE_URL/rest/v1/$t?limit=1" `
        -Headers @{apikey=$env:SUPABASE_ANON_KEY} `
        -Method GET -UseBasicParsing -TimeoutSec 6

        Write-Host "   🟢 OK — Existe e responde!" -ForegroundColor Green
    } catch {
        Write-Host "   🟠 Não encontrada — criando automaticamente…" -ForegroundColor Yellow
        supabase db push
    }
}

Start-Sleep -Seconds 1


# ================================================
# 4) LIMPEZA DO NEXT.JS
# ================================================
Write-Host "🧹 Limpando cache .next..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "✅ Cache limpo." -ForegroundColor Green


# ================================================
# 5) LIBERAR FIREWALL
# ================================================
Write-Host "🔓 Liberando porta 3000..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="PecuariaTech-3000" dir=in action=allow protocol=TCP localport=3000 | Out-Null
Write-Host "✅ Porta liberada." -ForegroundColor Green


# ================================================
# 6) BUILD + DEPLOY (VERCEL)
# ================================================
Write-Host "🏗  Iniciando build do projeto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "🔴 Erro na build! Corrija antes de continuar." -ForegroundColor Red
    exit
}

Write-Host "🚀 Deployando na Vercel (produção)..." -ForegroundColor Cyan
vercel --prod --yes


# ================================================
# 7) INICIAR NEXT.JS LOCALMENTE
# ================================================
Write-Host "✨ Iniciando servidor local 0.0.0.0:3000..." -ForegroundColor Cyan
npm run dev -- -H 0.0.0.0


