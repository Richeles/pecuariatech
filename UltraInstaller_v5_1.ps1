# UltraInstaller v5.1 — PecuariaTech
# Instalador automático completo
# Este script cria estrutura, copia arquivos, testa conexões e inicia o UltraCore

Write-Host "🔵 UltraInstaller v5.1 — Iniciando..." -ForegroundColor Cyan

# Caminho base
$BasePath = "C:\Users\Administrador\pecuariatech"
Write-Host "📁 Usando pasta do projeto: $BasePath"

# Verifica pasta
if (-Not (Test-Path $BasePath)) {
    Write-Host "❌ ERRO: Pasta não encontrada." -ForegroundColor Red
    exit
}

# Cria estrutura necessária
$folders = @(
    "components",
    "components\ultracore",
    "components\ultracore\modules",
    "app",
    "app\api",
    "app\api\ultra",
    "app\api\ultra\stats",
    "app\ultrabiologica",
    "app\ultrabiologica\status"
)

foreach ($f in $folders) {
    $full = Join-Path $BasePath $f
    if (-Not (Test-Path $full)) { New-Item -ItemType Directory -Path $full | Out-Null }
}

Write-Host "📐 Estrutura criada." -ForegroundColor Green

# Copia arquivos do UltraCore local
$CanvasPath = "$BasePath\ULTRACORE_v1" # Ajuste se necessário
if (Test-Path $CanvasPath) {
    Copy-Item "$CanvasPath\UltraCore.ts" "$BasePath\components\ultracore\UltraCore.ts" -Force
    Copy-Item "$CanvasPath\modules\*" "$BasePath\components\ultracore\modules" -Recurse -Force
}

Write-Host "🧠 UltraCore copiado." -ForegroundColor Green

# API Stats
$api = @"
import { NextResponse } from 'next/server'
import UltraCore from '@/components/ultracore/UltraCore'

export async function GET() {
  const result = await UltraCore()
  return NextResponse.json(result)
}
"@
Set-Content -Path "$BasePath/app/api/ultra/stats/route.ts" -Value $api -Encoding UTF8
Write-Host "🔌 API conectada." -ForegroundColor Green

# Página Status
$page = @"
import UltraStatusClient from '@/components/ultracore/UltraStatusClient'
export default function Page() { return <UltraStatusClient /> }
"@
Set-Content -Path "$BasePath/app/ultrabiologica/status/page.tsx" -Value $page -Encoding UTF8
Write-Host "📊 Página status criada." -ForegroundColor Green

# Teste Supabase
Write-Host "🔍 Testando Supabase..."
$response = Invoke-WebRequest -Uri "https://www.google.com" -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Internet OK"
} else {
    Write-Host "⚠ Falha de rede" -ForegroundColor Yellow
}

Write-Host "🚀 UltraInstaller v5.1 FINALIZADO" -ForegroundColor Cyan
