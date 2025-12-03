Write-Host "🔧 UltraFix RAW — SmartWeather ..." -ForegroundColor Cyan

$weatherPath = "C:\Users\Administrador\pecuariatech\components\SmartWeather.tsx"

# Remover arquivo antigo
if (Test-Path $weatherPath) {
    Remove-Item $weatherPath -Force
    Write-Host "🗑 Removido arquivo antigo SmartWeather.tsx" -ForegroundColor Yellow
}

# Criar arquivo usando HEREDOC literal (NENHUM ESCAPE)
@"
"use client";

interface Props {
  temp: number | null;
  cond: string;
}

export default function SmartWeather({ temp, cond }: Props) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md mt-3">
      <h2 className="text-lg font-semibold text-green-700 mb-1">🌦️  Clima Atual</h2>
      <p className="text-gray-700">
        {cond} — {temp !== null ? `${temp}°C` : '---'}
      </p>
    </div>
  );
}
"@ | Set-Content -Path $weatherPath -Encoding UTF8

Write-Host "✅ Novo SmartWeather.tsx criado (modo RAW)!" -ForegroundColor Green

# Limpar cache Next.js
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "🧹 Cache .next limpo!" -ForegroundColor Yellow
}

# Build
Write-Host "📦 Rodando build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 BUILD OK! DEPLOY LIBERADO!" -ForegroundColor Green
} else {
    Write-Host "❌ ERRO NO BUILD — Envie o log!" -ForegroundColor Red
}
