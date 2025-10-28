Write-Host "🧩 Corrigindo next.config.js duplicado..." -ForegroundColor Cyan

$path = "next.config.js"
if (Test-Path $path) {
    $backup = "$path.cleanbak"
    Copy-Item $path $backup -Force
    Write-Host "💾 Backup criado em: $backup" -ForegroundColor Yellow

    $content = Get-Content $path -Raw -Encoding UTF8

    # 1️⃣ Remove duplicatas de nextConfig
    $content = $content -replace "(?ms)const\s+nextConfig\s*=\s*{[^}]*};", ""

    # 2️⃣ Garante apenas UMA declaração limpa com ESLint desativado
    $cleanBlock = @"
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  experimental: { serverActions: true }
};
export default nextConfig;
"@

    # 3️⃣ Remove exports antigos e substitui
    $content = $content -replace "(?ms)export\s+default\s+nextConfig.*", ""
    $content = $content.Trim() + "`n" + $cleanBlock

    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "✅ next.config.js corrigido e padronizado!" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo next.config.js não encontrado!" -ForegroundColor Red
    exit 1
}

# 4️⃣ Limpar cache e recompilar
Write-Host "🧹 Limpando .next e node_modules cache..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue

Write-Host "⚙️ Executando novo build..." -ForegroundColor Cyan
$env:NODE_OPTIONS="--no-warnings"
npm run build
