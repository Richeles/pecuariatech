Write-Host "🐂 UltraCow Animator v2 — injetando animação no layout..." -ForegroundColor Cyan

$root = "C:\Users\Administrador\pecuariatech"
$layoutFile = "$root\app\layout.tsx"

if (!(Test-Path $layoutFile)) {
    Write-Host "❌ layout.tsx não encontrado em /app. Verifique estrutura." -ForegroundColor Red
    exit
}

# 1) Ler arquivo
$content = Get-Content $layoutFile -Raw

# 2) Forçar importações necessárias
if ($content -notmatch "import { motion } from 'framer-motion';") {
    $content = "import { motion } from 'framer-motion';`r`n" + $content
}

if ($content -notmatch "import Image from 'next/image';") {
    $content = "import Image from 'next/image';`r`n" + $content
}

# 3) Injetar animação antes do fechamento </body>
$animationBlock = @"
<motion.div
  initial={{ x: '-20%' }}
  animate={{ x: '120%' }}
  transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
  style={{ position: 'fixed', bottom: 25, left: 0, zIndex: 1000 }}
>
  <Image src="/boi.png" alt="Boi" width={150} height={150} />
</motion.div>
"@

if ($content -notmatch "src=\"/boi.png\"") {
    $content = $content -replace "</body>", "$animationBlock`r`n</body>"
    Write-Host "✨ Animação do boi adicionada ao layout!" -ForegroundColor Green
} else {
    Write-Host "✔ O boi já está animado no layout — nada a fazer." -ForegroundColor Yellow
}

# 4) Salvar
Set-Content $layoutFile $content -Force

Write-Host "🐂 UltraCow Animator v2 concluído!"
