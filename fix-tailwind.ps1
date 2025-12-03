Write-Host "🔧 Iniciando correção do Tailwind + PostCSS..."

# Backup do postcss.config.js
if (Test-Path "postcss.config.js") {
    Copy-Item "postcss.config.js" "postcss.config.js.bak" -Force
    Write-Host "📄 Backup do postcss.config.js criado em postcss.config.js.bak"
}

# Corrige configuração PostCSS (Next.js 15+ requer @tailwindcss/postcss)
$postcssConfig = @"
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
"@
Set-Content -Path "postcss.config.js" -Value $postcssConfig -Encoding UTF8
Write-Host "✅ postcss.config.js atualizado com sintaxe compatível Next.js 15+"

# Remover dependências antigas
Write-Host "🧹 Limpando node_modules, .next e package-lock.json..."
Remove-Item -Recurse -Force "node_modules","package-lock.json",".next" -ErrorAction SilentlyContinue

# Reinstalar dependências com o pacote novo
Write-Host "📦 Instalando dependências..."
npm install -D tailwindcss@latest postcss autoprefixer @tailwindcss/postcss
npm install

# Ajustar globals.css
if (Test-Path "src\app\globals.css") {
    (Get-Content "src\app\globals.css") |
        ForEach-Object { $_ -replace 'tailwindcss/base', '@tailwindcss/postcss/base' } |
        ForEach-Object { $_ -replace 'tailwindcss/components', '@tailwindcss/postcss/components' } |
        ForEach-Object { $_ -replace 'tailwindcss/utilities', '@tailwindcss/postcss/utilities' } |
        Set-Content "src\app\globals.css" -Encoding UTF8
    Write-Host "✅ globals.css ajustado com sintaxe Tailwind correta"
}

# Rodar build local para validar
Write-Host "🏗 Rodando build local..."
npm run build

Write-Host "🚀 Build local concluído com sucesso!"
Write-Host "📌 Após isso, faça o deploy no Vercel com: vercel --prod"
Write-Host "✅ Script finalizado!"
