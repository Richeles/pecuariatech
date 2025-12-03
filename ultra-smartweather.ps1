#Requires -Version 7
<#
Ultra SmartWeather v1 — PecuariaTech
- Adiciona componente de clima com GPS no Dashboard
- Sem dependências externas (usa Open-Meteo, sem API key)
#>

Write-Host "🚀 Ultra SmartWeather v1 — Instalando no Dashboard..." -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
$compDir = Join-Path $root "app\components"
$compFile = Join-Path $compDir "SmartWeather.tsx"
$dashFile = Join-Path $root "app\dashboard\page.tsx"
$dashBackup = Join-Path $root "app\dashboard\page.dashboard.bak"

# 1) Garantir pasta de componentes
if (-not (Test-Path $compDir)) { New-Item -ItemType Directory -Force -Path $compDir | Out-Null }

# 2) Criar/atualizar SmartWeather.tsx (UTF-8 sem BOM)
$smartWeatherTsx = @"
'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Coords = { lat: number; lon: number };
type CurrentWeather = {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
};
type Forecast = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
};

type WeatherData = {
  current: CurrentWeather | null;
  forecast: Forecast | null;
};

const WMO: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predom. claro',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro depositante',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa forte',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Aguaceiros',
  81: 'Aguaceiros fortes',
  82: 'Aguaceiros muito fortes',
  95: 'Trovoadas',
  96: 'Trovoadas granizo',
  99: 'Trovoadas granizo forte'
};

function formatDateISOToBR(iso: string) {
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  } catch { return iso; }
}

function recomendacaoAguaEForragem(current: CurrentWeather | null, forecast: Forecast | null) {
  // Regras simples: avalia precipitação média dos próximos 3 dias e temperatura atual
  const avgPrec =
    forecast && forecast.precipitation_sum.length
      ? forecast.precipitation_sum.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, forecast.precipitation_sum.length)
      : 0;

  const temp = current?.temperature ?? 28;

  let agua = 'Oferta padrão (2% do PV/dia).';
  if (temp >= 32 || avgPrec < 1) agua = 'Aumentar oferta (3–4% do PV/dia) e sombreamento.';
  if (temp <= 20) agua = 'Oferta padrão; monitorar consumo reduzido em dias frios.';

  let forragem = 'Braquiárias e Panicum de boa adaptação ao Cerrado.';
  if (avgPrec >= 10) forragem = 'Rotacionar áreas com maior vigor (Panicum cv. Mombaça/Zuri) e considerar adubação.';
  else if (avgPrec < 1) forragem = 'Priorizar forrageiras tolerantes à seca (Brachiaria brizantha cv. Marandu/Piatã).';

  const manejo = (temp >= 32)
    ? 'Programar pastejo nas horas mais frescas; disponibilizar sombra/sal mineral.'
    : (avgPrec >= 10 ? 'Aproveitar janela úmida para recuperação de pastos e plantio.' : 'Evitar superpastejo; alongar descanso.');

  return { agua, forragem, manejo, avgPrec, temp };
}

async function fetchOpenMeteo(coords: Coords): Promise<WeatherData> {
  const { lat, lon } = coords;
  const base = 'https://api.open-meteo.com/v1/forecast';
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,wind_speed_10m,wind_direction_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Cuiaba',
    forecast_days: '5'
  });

  const url = \`\${base}?\${params.toString()}\`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Falha ao consultar Open-Meteo');
  const j = await r.json();

  const current: CurrentWeather = {
    temperature: j?.current?.temperature_2m ?? j?.current_weather?.temperature ?? 0,
    windspeed: j?.current?.wind_speed_10m ?? j?.current_weather?.windspeed ?? 0,
    winddirection: j?.current?.wind_direction_10m ?? j?.current_weather?.winddirection ?? 0,
    weathercode: j?.current?.weather_code ?? j?.current_weather?.weathercode ?? 0,
  };

  const forecast: Forecast = {
    time: j?.daily?.time ?? [],
    temperature_2m_max: j?.daily?.temperature_2m_max ?? [],
    temperature_2m_min: j?.daily?.temperature_2m_min ?? [],
    precipitation_sum: j?.daily?.precipitation_sum ?? [],
  };

  return { current, forecast };
}

function useCoords() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('GPS indisponível no navegador');
      return;
    }
    const watch = navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError('Permissão negada ou indisponível'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
    return () => { /* no-op */ };
  }, []);

  return { coords, error, setCoords };
}

export default function SmartWeather(): JSX.Element {
  const { coords, error, setCoords } = useCoords();
  const [data, setData] = useState<WeatherData>({ current: null, forecast: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLon, setManualLon] = useState<string>('');
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Cuiaba', []);

  useEffect(() => {
    const go = async () => {
      if (!coords) return;
      setLoading(true);
      try {
        setData(await fetchOpenMeteo(coords));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    void go();
  }, [coords]);

  const rec = useMemo(() => recomendacaoAguaEForragem(data.current, data.forecast), [data]);

  const handleManual = () => {
    const lat = Number(manualLat.replace(',', '.'));
    const lon = Number(manualLon.replace(',', '.'));
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      setCoords({ lat, lon });
    }
  };

  return (
    <div className="rounded-2xl p-4 md:p-6 shadow-sm border bg-white/70 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg md:text-xl font-semibold">🌦️ SmartWeather — Recomendação Agro</h2>
        <span className="text-xs text-gray-500">TZ: {tz}</span>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="text-sm text-gray-600">
            {coords ? (
              <span>📍 Lat {coords.lat.toFixed(4)}, Lon {coords.lon.toFixed(4)}</span>
            ) : error ? (
              <span className="text-amber-700">⚠️ {error}. Informe coordenadas manualmente.</span>
            ) : (
              <span>📍 Obtendo localização...</span>
            )}
          </div>

          <div className="mt-2 flex gap-2">
            <input
              className="border rounded px-2 py-1 text-sm w-28"
              placeholder="-20.45"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 text-sm w-28"
              placeholder="-54.60"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
            />
            <button
              onClick={handleManual}
              className="px-3 py-1 text-sm rounded bg-black text-white hover:opacity-90"
            >
              Usar
            </button>
          </div>

          <div className="mt-4 text-sm">
            {loading && <div>⏳ Buscando clima...</div>}
            {data.current && (
              <div className="space-y-1">
                <div>🌡️ <b>{data.current.temperature.toFixed(1)}°C</b></div>
                <div>💨 {data.current.windspeed.toFixed(0)} km/h</div>
                <div>🧭 {data.current.winddirection.toFixed(0)}°</div>
                <div>⛅ {WMO[data.current.weathercode] ?? 'Condição desconhecida'}</div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          {data.forecast && data.forecast.time.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-1 pr-3">Dia</th>
                    <th className="py-1 pr-3">Máx</th>
                    <th className="py-1 pr-3">Mín</th>
                    <th className="py-1 pr-3">Chuva (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.forecast.time.map((t, i) => (
                    <tr key={t} className="border-b last:border-0">
                      <td className="py-1 pr-3">{formatDateISOToBR(t)}</td>
                      <td className="py-1 pr-3">{data.forecast!.temperature_2m_max[i]?.toFixed(1)}</td>
                      <td className="py-1 pr-3">{data.forecast!.temperature_2m_min[i]?.toFixed(1)}</td>
                      <td className="py-1 pr-3">{data.forecast!.precipitation_sum[i]?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-xs text-gray-500">
                Fonte: Open-Meteo · Sem necessidade de chave de API
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Sem previsão disponível.</div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border bg-emerald-50">
          <div className="text-xs uppercase text-emerald-700 font-semibold">Água</div>
          <div className="text-sm">{rec.agua}</div>
        </div>
        <div className="p-3 rounded-xl border bg-sky-50">
          <div className="text-xs uppercase text-sky-700 font-semibold">Pastagem</div>
          <div className="text-sm">{rec.forragem}</div>
        </div>
        <div className="p-3 rounded-xl border bg-amber-50">
          <div className="text-xs uppercase text-amber-700 font-semibold">Manejo</div>
          <div className="text-sm">{rec.manejo}</div>
        </div>
      </div>
    </div>
  );
}
"@

Set-Content -Path $compFile -Value $smartWeatherTsx -Encoding UTF8
Write-Host "✅ Componente criado: app/components/SmartWeather.tsx" -ForegroundColor Green

# 3) Plug-in no dashboard
if (Test-Path $dashFile) {
  Copy-Item $dashFile $dashBackup -Force
  $dash = Get-Content $dashFile -Raw

  # Garante 'use client' no topo
  if ($dash -notmatch "^\s*'use client';") {
    $dash = "'use client';`r`n" + $dash
  }

  # Adiciona import se não existir
  if ($dash -notmatch "from\s+['""]\s*../components/SmartWeather['""]") {
    $dash = $dash -replace "(\r?\n)export\s+default\s+function", "`$1import SmartWeather from '../components/SmartWeather';`$1export default function"
  }

  # Injeta <SmartWeather/> no JSX (logo após primeiro <div> ou no início do retorno)
  if ($dash -match "return\s*\(\s*<([^>]+)>") {
    $dash = $dash -replace "return\s*\(\s*<([^>]+)>", "return (`r`n  <`$1>`r`n    <SmartWeather />"
  } elseif ($dash -match "return\s*\(") {
    $dash = $dash -replace "return\s*\(", "return (`r`n  <div>`r`n    <SmartWeather />"
    $dash = $dash -replace "\)\s*;\s*$", "`r`n  </div>`r`n);"
  }

  Set-Content -Path $dashFile -Value $dash -Encoding UTF8
  Write-Host "🔌 SmartWeather plugado no dashboard (backup em app/dashboard/page.dashboard.bak)" -ForegroundColor Green
} else {
  Write-Host "⚠️ app/dashboard/page.tsx não encontrado. Pulei a integração automática." -ForegroundColor Yellow
}

# 4) Build
Write-Host "🧹 Limpando .next ..." -ForegroundColor DarkGray
if (Test-Path (Join-Path $root ".next")) { Remove-Item -Recurse -Force (Join-Path $root ".next") }

Write-Host "⚙️ Executando build..." -ForegroundColor Cyan
npm run build
