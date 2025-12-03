Write-Host "[INFO] Iniciando correção visual do PecuariaTech..." -ForegroundColor Cyan

# 1️⃣ Limpeza de build e cache antigo
Write-Host "[1] Limpando cache local..."
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .vercel -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue

# 2️⃣ Reinstalando dependências base (Tailwind, PostCSS)
Write-Host "[2] Reinstalando dependências essenciais..."
npm install tailwindcss postcss autoprefixer

# 3️⃣ Garantindo layout.tsx funcional e limpo
Write-Host "[3] Atualizando layout.tsx..."
@"
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PecuariaTech',
  description: 'Gestão inteligente do campo — Rebanho, Pastagem e Finanças',
}

export default function RootLayout({ children }) {
  return (
    <html lang='pt-BR'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
"@ | Set-Content -Path .\app\layout.tsx -Encoding UTF8

# 4️⃣ Recriando CSS global com visual limpo
Write-Host "[4] Atualizando globals.css..."
@"
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  color: #111827;
  margin: 0;
  padding: 0;
}

main {
  padding: 1rem;
}
"@ | Set-Content -Path .\app\globals.css -Encoding UTF8

# 5️⃣ Reconstruindo o projeto
Write-Host "[5] Gerando nova build otimizada..."
npm run build

# 6️⃣ Publicando versão limpa
Write-Host "[6] Fazendo deploy limpo na Vercel..." -ForegroundColor Green
vercel --prod --force

Write-Host "✅ Deploy visual concluído! Confira o site em: https://www.pecuariatech.com" -ForegroundColor Cyan
