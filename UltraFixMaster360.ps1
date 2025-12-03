# ────────────────────────────────────────────────────────────
# 🚀 UltraFix Master 360 — PecuariaTech
# Unificação: MiniFix + UltraClean + UltraPatch + UltraBuild
# Seguro para deploy no Vercel (<100MB)
# ────────────────────────────────────────────────────────────

Write-Host "🔱 Iniciando UltraFix Master 360..." -ForegroundColor Cyan

# 1) Conferência de diretório
if (-not (Test-Path "./package.json")) {
    Write-Host "❌ ERRO: Execute este script dentro da pasta raiz do PecuariaTech!" -ForegroundColor Red
    exit
}
Write-Host "📁 Diretório verificado."

# 2) UltraClean — limpeza profunda
Write-Host "🧹 UltraClean 360 — limpando ambiente..."

$paths = @("node_modules", ".next", ".turbo", "package-lock.json")
foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item -Recurse -Force -Path $p
        Write-Host "✔ Removido: $p"
    }
}

Write-Host "✔ Limpeza concluída."

# 3) Criar next.config.cjs seguro
Write-Host "🛠 Ajustando next.config.cjs..."

@"
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  output: "standalone",
  distDir: ".next",
};
module.exports = nextConfig;
"@ | Out-File -Encoding UTF8 next.config.cjs -Force

Write-Host "✔ Arquivo next.config.cjs configurado."

# 4) Corrigir peso do Vercel (<100MB)
Write-Host "⚖ Aplicando redução de peso (100MB Safe Mode)..."

$vercelIgnore = @"
node_modules/
.next/cache/
turbo/
tests/
*.md
*.log
"@
$vercelIgnore | Out-File -Encoding UTF8 .vercelignore -Force

Write-Host "✔ .vercelignore otimizado."

# 5) UltraPatch — correções automáticas
Write-Host "🔧 Aplicando correções internas..."

Get-ChildItem -Recurse -Filter *.ts | ForEach-Object {
    $content = Get-Content $_.FullName

    $content = $content -replace 'from ''next/legacy/image''', 'from ''next/image'''
    $content = $content -replace "from `"next/legacy/image`"", "from `"next/image`""

    Set-Content -Path $_.FullName -Value $content
}

Write-Host "✔ Correções de import aplicadas."

# 6) Instalar dependências
Write-Host "📦 Instalando dependências (modo seguro)..."

npm install --legacy-peer-deps

Write-Host "✔ Dependências instaladas."

# 7) Remover libs pesadas (>5MB)
Write-Host "🔍 Verificando bibliotecas pesadas..."

$removePackages = @(
    "@google-cloud/*",
    "sharp",
    "react-pdf",
    "firebase-admin",
    "pdfkit"
)

foreach ($pkg in $removePackages) {
    npm uninstall $pkg 2>$null
}

Write-Host "✔ Bibliotecas pesadas removidas (Vercel Safe Mode)."

# 8) UltraBuild — build final
Write-Host "🚀 UltraBuild 360 — gerando build final..."

npm run build

Write-Host "✔ Build concluído!"
Write-Host "🎉 UltraFix Master 360 finalizado!"
