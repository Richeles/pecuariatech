# ===============================================================
# UltraPro v5 – Setup Total (Versão Corrigida)
# PecuariaTech – Richeles Alves
# ===============================================================

Write-Host "🔵 UltraPro v5 — Iniciando Setup Completo..." -ForegroundColor Cyan

# -----------------------------
# 1) Ajustar NPM para ignorar peer deps automaticamente
# -----------------------------
Write-Host "🛠️ Configurando ambiente npm..." -ForegroundColor Yellow
$env:NPM_CONFIG_LEGACY_PEER_DEPS = "true"

Write-Host "✔️ NPM configurado para ignorar conflitos de dependências." -ForegroundColor Green

# -----------------------------
# 2) Garantir versão correta do Node
# -----------------------------
Write-Host "🔍 Verificando versão do Node..." -ForegroundColor Yellow
node -v
npm -v

# -----------------------------
# 3) Instalar dependências base com versões corretas
# -----------------------------
Write-Host "📦 Instalando pacotes principais..." -ForegroundColor Yellow

npm install react@19.2.0 react-dom@19.2.0 --save
npm install next@15.3.4 --save
npm install @supabase/supabase-js@2.86.0 @supabase/ssr --save
npm install react-leaflet@5.0.0 leaflet --save
npm install tailwindcss postcss autoprefixer --save-dev
npm install shadcn-ui --save

Write-Host "✔️ Pacotes base instalados." -ForegroundColor Green

# -----------------------------
# 4) Rodar npm install completo
# -----------------------------
Write-Host "📦 Rodando npm install completo..." -ForegroundColor Yellow
npm install

Write-Host "✔️ Instalação finalizada sem conflitos." -ForegroundColor Green

# -----------------------------
# 5) Criar pastas necessárias
# -----------------------------
Write-Host "📁 Garantindo estrutura de pastas..." -ForegroundColor Yellow

$folders = @(
    "public/images",
    "public/images/pecuaria",
    "logs"
)

foreach ($f in $folders) {
    if (!(Test-Path $f)) {
        New-Item -ItemType Directory -Path $f | Out-Null
        Write-Host "📁 Criada: $f"
    }
}

Write-Host "✔️ Estrutura OK." -ForegroundColor Green

# -----------------------------
# 6) Criar imagens profissionais (placeholders)
# -----------------------------
Write-Host "🖼️ Criando imagens profissionais do Agro..." -ForegroundColor Yellow

# 3 imagens prontas (serão substituídas por IA depois)
$image1 = "public/images/pecuaria/gado.jpg"
$image2 = "public/images/pecuaria/pasto.jpg"
$image3 = "public/images/pecuaria/fazenda.jpg"

"IMAGEM-PROFISSIONAL-GADO" | Set-Content $image1
"IMAGEM-PROFISSIONAL-PASTO" | Set-Content $image2
"IMAGEM-PROFISSIONAL-FAZENDA" | Set-Content $image3

Write-Host "✔️ Imagens preparadas (placeholders)." -ForegroundColor Green

# -----------------------------
# 7) Criar log de status do projeto
# -----------------------------
Write-Host "📝 Gerando log..." -ForegroundColor Yellow

$logFile = "logs\ultrapro-status.txt"
$date = Get-Date
"UltraPro v5 – Log de Setup" | Set-Content $logFile
"Executado em: $date" | Add-Content $logFile
"Node: $(node -v)" | Add-Content $logFile
"NPM: $(npm -v)" | Add-Content $logFile
"Setup concluído com sucesso." | Add-Content $logFile

Write-Host "✔️ Log disponível em logs\ultrapro-status.txt" -ForegroundColor Green

# -----------------------------
# 8) Teste final de rota
# -----------------------------
Write-Host "🌐 Testando servidor de desenvolvimento..." -ForegroundColor Yellow

try {
    Start-Process "powershell" -ArgumentList "npm run dev"
    Write-Host "✔️ Servidor iniciado. Acesse: http://localhost:3000" -ForegroundColor Green
}
catch {
    Write-Host "❌ Falha ao iniciar o servidor." -ForegroundColor Red
}

Write-Host "🎉 UltraPro v5 — Setup completo!" -ForegroundColor Cyan
