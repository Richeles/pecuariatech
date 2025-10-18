# ============================================================
# 🧠 UltraBiológica Cloud – Deploy Fix Automático (v1.0)
# Corrige importações, atualiza PWA e faz deploy no Vercel
# ============================================================

Write-Host "`n🚀 Iniciando correção e deploy automático..." -ForegroundColor Cyan
Set-Location "C:\Users\Administrador\pecuariatech"

# 1️⃣ Verificar se o componente SWRegister existe
$componentPath = ".\components\SWRegister.tsx"
if (-Not (Test-Path $componentPath)) {
    Write-Host "⚠️ Componente SWRegister.tsx não encontrado. Criando automaticamente..." -ForegroundColor Yellow
    @"
"use client"
import React, { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        () => console.log('✅ Service Worker registrado com sucesso'),
        (err) => console.warn('⚠️ Falha ao registrar o Service Worker', err)
      )
    }
  }, [])

  return (
    <div style={{ display: 'none' }}>
      {/* SWRegister ativo */}
    </div>
  )
}
"@ | Set-Content -Path $componentPath -Encoding utf8 -Force
    Write-Host "✅ Componente SWRegister.tsx criado com sucesso!" -ForegroundColor Green
}

# 2️⃣ Corrigir import no layout.tsx
$layoutPath = ".\app\layout.tsx"
if (Test-Path $layoutPath) {
    $content = Get-Content -Path $layoutPath -Raw
    if ($content -match "@/components/SWRegister") {
        Write-Host "🔧 Corrigindo import incorreto '@/components/SWRegister' → '../components/SWRegister'..."
        $content = $content -replace "@/components/SWRegister", "../components/SWRegister"
        Set-Content -Path $layoutPath -Value $content -Encoding utf8 -Force
        Write-Host "✅ Importação corrigida com sucesso." -ForegroundColor Green
    } else {
        Write-Host "✅ Importação já está correta." -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ layout.tsx não encontrado em app/. Verifique estrutura do projeto." -ForegroundColor Yellow
}

# 3️⃣ Garantir que o Service Worker exista
$swPath = ".\public\sw.js"
if (-Not (Test-Path $swPath)) {
    Write-Host "⚙️ Criando arquivo sw.js padrão..." -ForegroundColor Yellow
    @"
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado.')
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativo.')
})

self.addEventListener('fetch', (event) => {
  // Cache básico opcional
})
"@ | Set-Content -Path $swPath -Encoding utf8 -Force
    Write-Host "✅ sw.js criado com sucesso." -ForegroundColor Green
}

# 4️⃣ Atualizar e enviar para o GitHub
Write-Host "`n📦 Atualizando repositório Git..."
git add .
git commit -m "fix: corrigir import SWRegister e garantir PWA funcional" 2>$null
git push origin main

# 5️⃣ Fazer build e deploy na Vercel
Write-Host "`n🚀 Enviando deploy de produção para Vercel..." -ForegroundColor Cyan
vercel --prod --yes | Tee-Object -FilePath "vercel_deploy_log.txt"

Write-Host "`n✅ Deploy finalizado! Verifique o link acima para confirmar o build." -ForegroundColor Green
Write-Host "📄 Log salvo em: vercel_deploy_log.txt"
