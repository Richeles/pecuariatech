Write-Host "🔧 UltraFix Next.js — Corrigindo arquivos de configuração..." -ForegroundColor Cyan

$root = "C:\Users\Administrador\pecuariatech"

# 1) Entrar na pasta do projeto
Set-Location $root

# 2) Renomear next.config.js para next.config.cjs se existir
if (Test-Path "$root\next.config.js") {
    Write-Host "➡️ Corrigindo next.config.js..."
    Rename-Item "$root\next.config.js" "next.config.cjs" -Force
}

# 3) Recriar conteúdo de config correto
$nextConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
"@

Set-Content -Path "$root\next.config.cjs" -Value $nextConfig -Force
Write-Host "✔ next.config.cjs corrigido."

# 4) Corrigir postcss.config.js
if (Test-Path "$root\postcss.config.js") {
    Write-Host "➡️ Corrigindo postcss.config.js..."
    Rename-Item "$root\postcss.config.js" "postcss.config.cjs" -Force
}

$postcss = @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@

Set-Content -Path "$root\postcss.config.cjs" -Value $postcss -Force
Write-Host "✔ postcss.config.cjs corrigido."

# 5) Limpar cache do Next
Write-Host "🧹 Limpando cache do Next.js..."
if (Test-Path "$root\.next") {
    Remove-Item -Recurse -Force "$root\.next"
}

# 6) Instalar dependências novamente
Write-Host "📦 Instalando dependências..."
npm install

# 7) Reiniciar ambiente de desenvolvimento
Write-Host "🚀 Iniciando Next.js novamente..."
npm run dev
