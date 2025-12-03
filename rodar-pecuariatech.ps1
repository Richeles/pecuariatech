Write-Host "🔰 PECUARIATECH — UltraRun 360º Iniciando..." -ForegroundColor Cyan

# ============================
# 1) Variáveis de Ambiente
# ============================
Write-Host "🔧 Definindo variáveis do Supabase..."

$env:NEXT_PUBLIC_SUPABASE_URL = "https://kpzjekflqpoeccnqfkng.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDcxNTIsImV4cCI6MjA2NjM4MzE1Mn0.0QL2lRFVTXTr_2DFV0dywfElLzXirgFvx0qZRWPZUSQ"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_24L7SRlrwKIXoNXMgg-QIQ_DbgOZTmg"

Write-Host "✅ Variáveis configuradas."

# ============================
# 2) Limpar Cache do Next
# ============================
Write-Host "🧹 Limpando cache .next..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
Write-Host "✅ Cache limpo."

# ============================
# 3) Instalar dependências
# ============================
Write-Host "📦 Conferindo node_modules..."
if (-not (Test-Path "node_modules")) {
    Write-Host "⬇ Instalando dependências..."
    npm install
}

# ============================
# 4) Liberar porta 3000
# ============================
Write-Host "🔓 Liberando porta 3000 no firewall..."
netsh advfirewall firewall add rule name="NextJS3000" dir=in action=allow protocol=TCP localport=3000 | Out-Null

Write-Host "✅ Porta liberada."

# ============================
# 5) Rodar o projeto
# ============================
Write-Host "🚀 Iniciando Next.js (acessível na rede local)..."

npm run dev -- -H 0.0.0.0
