Write-Host "🛠️ UltraFix — Correção DEFINITIVA do caminho do Next.js" -ForegroundColor Cyan

# 1. Remover qualquer instalação global do Next
Write-Host "🔧 Removendo Next.js global corrompido..."
npm uninstall -g next 2>$null
npm uninstall -g create-next-app 2>$null

# 2. Remover o caminho inválido para next do npm prefix
Write-Host "🔧 Resetando prefixo global do npm..."
npm config delete prefix
npm config set prefix "$env:APPDATA\npm"

# 3. Garantir que o PATH não contenha caminhos inválidos
Write-Host "🧹 Limpando variáveis de ambiente..."
$envPaths = [Environment]::GetEnvironmentVariable("PATH", "User") -split ";"
$cleanPaths = $envPaths | Where-Object { $_ -notlike "*C:\Users\Administrador\next*" }
[Environment]::SetEnvironmentVariable("PATH", ($cleanPaths -join ";"), "User")

# 4. Reinstalar dependências do projeto
Write-Host "📦 Reinstalando dependências..."
Remove-Item -Recurse -Force node_modules -ErrorAction Ignore
Remove-Item -Recurse -Force .next -ErrorAction Ignore
npm cache clean --force
npm install

# 5. Garantir Next.js LOCAL
Write-Host "📦 Instalando Next.js localmente..."
npm install next@latest --save

# 6. Testar execução
Write-Host "🚀 Testando execução local do Next.js..."
npx next --version

Write-Host "✅ UltraFix Finalizado! Agora pode rodar:"
Write-Host "👉 npm run dev"
