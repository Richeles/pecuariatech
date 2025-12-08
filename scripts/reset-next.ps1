Write-Host "🔄 UltraReset — Reparando caminho do Next.js" -ForegroundColor Cyan

Set-Location "C:\Users\Administrador\pecuariatech"

Write-Host "🗑️ Removendo node_modules..."
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue

Write-Host "🗑️ Removendo pasta .next..."
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue

Write-Host "🗑️ Limpando cache do npm..."
npm cache clean --force

Write-Host "📦 Instalando dependências do ZERO..."
npm install

Write-Host "📌 Forçando npm a usar prefixo LOCAL do projeto..."
npm config set prefix "$(Get-Location)"

Write-Host "📦 Reinstalando Next.js corretamente..."
npm install next@latest --save

Write-Host "🏗️ Gerando build..."
npm run build

Write-Host "🚀 Iniciando servidor..."
npm run dev
