Write-Host "🐂 UltraCow Animator v3 — injetando animação no layout..." -ForegroundColor Cyan

$root = "C:\Users\Administrador\pecuariatech"
$layoutFile = "$root\app\layout.tsx"

# 1) Verifica se o layout existe
if (!(Test-Path $layoutFile)) {
    Write-Host "❌ layout.tsx não encontrado em /app. Estrutura incorreta." -ForegroundColor Red
    exit
}

# 2) Ler arquivo inteiro
$content = Get-Content $layoutFile -Raw

# 3) Inserir imports se não existirem
if ($content -notmatch "motion") {
    Write-Host "📌 Inserindo import motion..."
    $content = "import { motion } from 'framer-motion';`r`n" + $content
}

if ($content -notmatch "Image from") {
    Write-Host "📌 Inserindo import Image..."
    $content = "import Image from 'next/image';`r`n" + $content
}

# 4) Bloco da animação do boi
$animationBlock = @"
<motion.div
  initial={{ x: '-20%' }}
  animate={{ x: '120%' }}
  transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
  style={{ position: 'fixed', bottom: 25, left: 0, zIndex: 1000 }}
>
  <Image src='/boi.png' alt='Boi' width={150} height={150} />
</motion.div>
"@

# 5) Inserir bloco antes do </body>
if ($content -notmatch "boi.png") {
    Write-Host "✨ Injetando boi no layout..."
    $content = $content -replace "</body>", "$animationBlock`r`n</body>"
} else {
    Write-Host "✔ Layout já contém boi animado — nada a fazer." -ForegroundColor Yellow
}

# 6) Salvar arquivo
Set-Content $layoutFile $content -Force

Write-Host "🐂 UltraCow Animator v3 concluído!" -ForegroundColor Green
