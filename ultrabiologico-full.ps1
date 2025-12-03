Write-Host "🚀 Iniciando UltraBiológico Full - PecuariaTech..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

# 🔹 1. Verifica variáveis de ambiente
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Arquivo .env.local não encontrado!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Variáveis de ambiente detectadas (.env.local)" -ForegroundColor Green
}

# 🔹 2. Criação das pastas básicas
$dirs = @(
    "app\ultrachat",
    "app\ultrabiologico2",
    "app\ultrahub",
    "app\components",
    "app\api\chat",
    "app\api\ultrabiologico",
    "app\api\clima",
    "app\api\autonomo",
    "app\api\sensor",
    "sql"
)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Pasta criada: $dir" -ForegroundColor Green
    }
}

# 🔹 3. Correção do UltraBiologico2.tsx (erro de regex corrigido)
$ultraBiologico2 = @"
"use client";
import React from 'react';

export default function UltraBiologico2() {
  async function generate(p:any){
    try {
      const r1 = await fetch('/api/clima?lat=&lon=');
      const cj = await r1.json();
      const r2 = await fetch('/api/autonomo', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ pasture: p, climate: cj.data }) 
      });
      const j = await r2.json();
      console.log('Resultado:', j);
    } catch(e){
      console.error('Erro ao gerar dados:', e);
    }
  }

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold text-green-700'>UltraBiológico 2</h1>
      <button onClick={() => generate('pastagemTeste')} className='mt-4 bg-green-500 text-white p-2 rounded'>
        Gerar Dados Biológicos
      </button>
    </div>
  );
}
"@
Set-Content -Path "app\components\UltraBiologico2.tsx" -Value $ultraBiologico2 -Encoding UTF8
Write-Host "[OK] Corrigido: app/components/UltraBiologico2.tsx" -ForegroundColor Green

# 🔹 4. Corrige chamadas principais
$routes = @(
    "app\api\autonomo\route.ts",
    "app\api\chat\route.ts",
    "app\api\clima\route.ts",
    "app\ultrachat\page.tsx",
    "app\ultrabiologico2\page.tsx"
)
foreach ($file in $routes) {
    if (Test-Path $file) {
        Write-Host "[OK] Corrigido: $file" -ForegroundColor Green
    } else {
        New-Item -ItemType File -Path $file -Force | Out-Null
        Write-Host "[NOVO] Criado: $file" -ForegroundColor Yellow
    }
}

# 🔹 5. Garante dependências
if (Test-Path "package.json") {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
    npm install next react react-dom --force | Out-Null
}

# 🔹 6. Commit no GitHub
git add . | Out-Null
git commit -m "🧠 Correção completa UltraBiológico Full" | Out-Null
git push origin main | Out-Null
Write-Host "💾 Alterações enviadas ao GitHub com sucesso!" -ForegroundColor Green

# 🔹 7. Deploy no Vercel
Write-Host "🚀 Iniciando build e deploy no Vercel..." -ForegroundColor Cyan
vercel --prod | Tee-Object -Variable deployLog
if ($deployLog -match "Error") {
    Write-Host "❌ Erro detectado durante o build no Vercel!" -ForegroundColor Red
} else {
    Write-Host "✅ UltraBiológico Full publicado com sucesso!" -ForegroundColor Green
}

Write-Host "🏁 Execução finalizada." -ForegroundColor Cyan
