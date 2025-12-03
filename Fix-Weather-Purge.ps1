Write-Host "🔥 UltraFix TOTAL — Removendo arquivos antigos..." -ForegroundColor Cyan

# Pastas onde o arquivo pode estar
$paths = @(
  "C:\Users\Administrador\pecuariatech\components\SmartWeather.tsx",
  "C:\Users\Administrador\pecuariatech\src\components\SmartWeather.tsx",
  "C:\Users\Administrador\pecuariatech\app\components\SmartWeather.tsx",
  "C:\Users\Administrador\pecuariatech\components\backup\SmartWeather.tsx"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item $p -Force
        Write-Host "🗑 Removido: $p" -ForegroundColor Yellow
    }
}

# Garante que a pasta principal exista
$mainDir = "C:\Users\Administrador\pecuariatech\components"
if (!(Test-Path $mainDir)) {
    New-Item -ItemType Directory -Path $mainDir | Out-Null
}

# Criar arquivo LIMPO usando RAW literal
Write-Host "📝 Criando SmartWeather.tsx FINAL..." -ForegroundColor Cyan

@'
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
'@ | Set-Content "$mainDir\SmartWeather.tsx" -Encoding UTF8

Write-Host "✅ SmartWeather.tsx recriado com sucesso!" -ForegroundColor Green

# Limpar cache
if (Test-Path ".next") {
    Remove-Item ".next" -Force -Recurse
    Write-Host "🧹 Cache .next limpo!" -ForegroundColor Yellow
}

# Build
Write-Host "📦 Rodando build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 BUILD OK! — Pode fazer deploy" -ForegroundColor Green
} else {
    Write-Host "❌ BUILD AINDA COM ERROS — Me envie o log" -ForegroundColor Red
}
