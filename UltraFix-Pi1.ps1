Write-Host "🔧 UltraFix π 1/3 — Normalizando estrutura..." -ForegroundColor Green

$root = "C:\Users\Administrador\pecuariatech"
Set-Location $root

Remove-Item "$root\next.config.js" -Force -ErrorAction SilentlyContinue
Remove-Item "$root\postcss.config.js" -Force -ErrorAction SilentlyContinue

@"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
"@ | Set-Content "$root\next.config.cjs" -Force

@"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@ | Set-Content "$root\postcss.config.cjs" -Force

(Get-Content "$root\package.json") | 
   Where-Object { $_ -notmatch '"type": "module"' } | 
   Set-Content "$root\package.json"

Write-Host "✔ Estrutura ajustada — continue com o ciclo 2" -ForegroundColor Cyan
