Write-Host "🧩 Corrigindo componentes do Dashboard (SmartWeather e Kpi)..." -ForegroundColor Cyan

# Caminho base
$base = "C:\Users\Administrador\pecuariatech\components"

# Criar diretório components, se não existir
if (-not (Test-Path $base)) {
    New-Item -ItemType Directory -Force -Path $base | Out-Null
    Write-Host "📁 Pasta 'components' criada." -ForegroundColor Yellow
}

# Criar SmartWeather.tsx
$smartWeather = @"
'use client';
import { useEffect, useState } from 'react';

export default function SmartWeather() {
  const [temp, setTemp] = useState<number | null>(null);
  const [cond, setCond] = useState<string>('Carregando...');

  useEffect(() => {
    // Simulação de clima - substitua por API real depois
    setTimeout(() => {
      setTemp(31);
      setCond('☀️ Ensolarado');
    }, 500);
  }, []);

  return (
    <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
      <h2 className="text-lg font-semibold text-green-700 mb-1">🌦️ Clima Atual</h2>
      <p className="text-gray-700">
        {cond} — {temp !== null ? `${temp}°C` : '---'}
      </p>
    </div>
  );
}
"@
Set-Content "$base\SmartWeather.tsx" $smartWeather -Encoding UTF8
Write-Host "✅ Componente SmartWeather.tsx criado." -ForegroundColor Green

# Criar Kpi.tsx
$kpi = @"
'use client';

interface KpiProps {
  title: string;
  value: number;
  emoji: string;
}

export default function Kpi({ title, value, emoji }: KpiProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center border border-gray-200">
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <p className="text-xl font-bold text-green-700">{value}</p>
    </div>
  );
}
"@
Set-Content "$base\Kpi.tsx" $kpi -Encoding UTF8
Write-Host "✅ Componente Kpi.tsx criado." -ForegroundColor Green

Write-Host "🏁 Componentes corrigidos! Agora rode: npm run build" -ForegroundColor Cyan
