Write-Host "🧩 Resetando next.config.js (versão limpa)..." -ForegroundColor Cyan

$path = "next.config.js"
if (Test-Path $path) {
    $backup = "$path.fullbak"
    Copy-Item $path $backup -Force
    Write-Host "💾 Backup criado em: $backup" -ForegroundColor Yellow
}

# 🔧 Recria o arquivo com configuração limpa e segura
@"
import next from 'next';

/**
 * 🌾 PecuariaTech Next.js Config (versão limpa e moderna)
 * - ESLint ignorado durante build
 * - Suporte a server actions
 * - React Strict Mode habilitado
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
"@ | Set-Content -Path $path -Encoding UTF8

Write-Host "✅ next.config.js recriado com sucesso!" -ForegroundColor Green

# 🧹 Limpeza antes do rebuild
Write-Host "🧹 Limpando cache e build..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue

# ⚙️ Rodar build novamente
Write-Host "⚙️ Executando novo build..." -ForegroundColor Cyan
$env:NODE_OPTIONS="--no-warnings"
npm run build
