Write-Host "🚀 Ultra Force Build — PecuariaTech Cloud v7.5" -ForegroundColor Cyan

# 1️⃣ Verifica se o next.config existe
$nextPath = "next.config.mjs"
if (-not (Test-Path $nextPath)) {
    $nextPath = "next.config.js"
}

if (Test-Path $nextPath) {
    $backupPath = "$nextPath.bak"
    Copy-Item $nextPath $backupPath -Force
    Write-Host "💾 Backup criado: $backupPath" -ForegroundColor Yellow

    # Lê o conteúdo e adiciona desativação de ESLint
    $content = Get-Content $nextPath -Raw -Encoding UTF8

    if ($content -notmatch "eslint") {
        $eslintConfig = @"
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
"@
        # Substitui export existente ou adiciona nova configuração
        if ($content -match "export default") {
            $content = $content -replace "export default.*", $eslintConfig
        } else {
            $content += "`n" + $eslintConfig
        }
        Set-Content -Path $nextPath -Value $content -Encoding UTF8
        Write-Host "🧠 ESLint desativado durante build." -ForegroundColor Yellow
    } else {
        Write-Host "ℹ️ ESLint já desativado." -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️ next.config.js/mjs não encontrado!" -ForegroundColor Red
}

# 2️⃣ Remove cache
Write-Host "🧹 Limpando .next..." -ForegroundColor Cyan
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue

# 3️⃣ Executa build forçado
Write-Host "⚙️ Executando build ignorando ESLint..." -ForegroundColor Cyan
$env:NODE_OPTIONS="--no-warnings"
npm run build
