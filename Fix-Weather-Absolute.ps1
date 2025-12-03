Write-Host "🔧 UltraFix Absoluto — SmartWeather ..." -ForegroundColor Cyan

$weatherPath = "C:\Users\Administrador\pecuariatech\components\SmartWeather.tsx"

# -----------------------------
# 🗑 Deletar arquivo antigo 100%
# -----------------------------
if (Test-Path $weatherPath) {
    Remove-Item $weatherPath -Force
    Write-Host "🗑 Arquivo antigo SmartWeather.tsx removido!" -ForegroundColor Yellow
}

# -----------------------------
# 📝 Criar novo arquivo do zero
# -----------------------------
$newWeather = @"
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
        {cond} — {temp !== null ? \`${temp}°C\` : '---'}
      </p>
    </div>
  );
}
"@

# Salvar o arquivo corrigido
Set-Content -Path $weatherPath -Value $newWeather -Encoding UTF8

Write-Host "✅ Novo SmartWeather.tsx criado com sucesso!" -ForegroundColor Green

# -----------------------------
# 🧹 Limpeza de cache local
# -----------------------------
Write-Host "🧹 Limpando cache do Next..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "🧹 Cache .next removido!" -ForegroundColor Yellow
}

# -----------------------------
# 🧪 Build para validar
# -----------------------------
Write-Host "📦 Rodando build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 BUILD OK! PRONTO PARA DEPLOY!" -ForegroundColor Green
} else {
    Write-Host "❌ BUILD COM ERRO — veja o log!" -ForegroundColor Red
}
