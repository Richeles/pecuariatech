#Requires -Version 7
<#
Script: ultra-smartweather-v3.ps1
Autor: Richeles Assistant
Versão: 3.0
Função: Instala o SmartWeather v3 com GPS inteligente, Supabase e análise climática completa.
#>

Write-Host "🌦️ Ultra SmartWeather v3 — PecuariaTech Cloud" -ForegroundColor Cyan

# Caminhos
$component = "app\components\SmartWeatherV3.tsx"
$dashboard = "app\dashboard\page.tsx"

# 1️⃣ Criar componente principal
Write-Host "🧩 Criando componente SmartWeatherV3.tsx ..." -ForegroundColor Yellow
@"
'use client';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createClient } from '@supabase/supabase-js';

type WeatherRecord = {
  date: string;
  temp: number;
  rain: number;
  humidity: number;
};

type WeatherData = {
  forecast: WeatherRecord[];
  recommendation: string;
  alert?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SmartWeatherV3(): React.ReactElement {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obter GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      async (err) => {
        setError('⚠️ GPS indisponível, buscando dados do Supabase...');
        const { data } = await supabase
          .from('clima_regional')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data) setData(data.data);
      }
    );
  }, []);

  // Buscar clima e armazenar
  useEffect(() => {
    if (!coords) return;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const url = \`https://api.open-meteo.com/v1/forecast?latitude=\${coords.lat}&longitude=\${coords.lon}&daily=temperature_2m_max,precipitation_sum,relative_humidity_2m_max&timezone=auto\`;
        const r = await fetch(url);
        const j = await r.json();

        const forecast = j.daily.time.map((d: string, i: number) => ({
          date: d,
          temp: j.daily.temperature_2m_max[i],
          rain: j.daily.precipitation_sum[i],
          humidity: j.daily.relative_humidity_2m_max[i]
        }));

        const avgTemp = forecast.reduce((a, b) => a + b.temp, 0) / forecast.length;
        const avgRain = forecast.reduce((a, b) => a + b.rain, 0) / forecast.length;

        let recommendation = '';
        let alert = '';

        if (avgRain < 5) {
          recommendation = '🌾 Brachiaria brizantha — resistente à seca.';
          alert = '🔥 Risco de seca! Aumente a irrigação e monitore a umidade.';
        } else if (avgRain > 40) {
          recommendation = '🌿 Capim Mombaça ou Tanzânia — ótimo para regiões úmidas.';
          alert = '💧 Excesso de chuva! Verifique drenagem do solo.';
        } else if (avgTemp > 30) {
          recommendation = '🍃 Andropogon — ideal para altas temperaturas.';
        } else {
          recommendation = '🌱 Piatã ou MG5 — bom equilíbrio climático.';
        }

        const weatherData: WeatherData = { forecast, recommendation, alert };
        setData(weatherData);

        // Salvar no Supabase
        await supabase.from('clima_regional').insert({
          latitude: coords.lat,
          longitude: coords.lon,
          data: weatherData,
          created_at: new Date().toISOString()
        });

      } catch (e) {
        setError('❌ Erro ao buscar dados climáticos.');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [coords]);

  if (error) return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">{error}</div>;
  if (loading || !data) return <div className="p-4 text-gray-600">Carregando dados climáticos...</div>;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md mt-4">
      <h2 className="text-xl font-bold mb-2">🌦️ Clima Inteligente — SmartWeather v3</h2>
      <p className="text-sm text-gray-600 mb-2">
        Localização: {coords?.lat.toFixed(2)}, {coords?.lon.toFixed(2)}
      </p>
      {data.alert && <div className="p-2 bg-red-100 text-red-700 rounded mb-2">{data.alert}</div>}
      <div className="p-2 bg-green-100 text-green-800 rounded mb-4">{data.recommendation}</div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data.forecast}>
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f59e0b" name="🌡️ Temp (°C)" />
          <Line yAxisId="left" type="monotone" dataKey="rain" stroke="#3b82f6" name="🌧️ Chuva (mm)" />
          <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#10b981" name="💧 Umidade (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
"@ | Set-Content -Path $component -Encoding UTF8

Write-Host "✅ Componente SmartWeatherV3 criado com sucesso!" -ForegroundColor Green

# 2️⃣ Injetar no Dashboard
if (Test-Path $dashboard) {
    Copy-Item $dashboard "$($dashboard).bak" -Force
    (Get-Content $dashboard) -replace "(?<=return\s*\()", "`r`n    <SmartWeatherV3 />`r`n" |
        Set-Content $dashboard -Encoding UTF8
    Add-Content $dashboard "`r`nimport SmartWeatherV3 from '../components/SmartWeatherV3';"
    Write-Host "🔌 SmartWeatherV3 plugado no Dashboard!" -ForegroundColor Green
}

# 3️⃣ Build final
Write-Host "🧹 Limpando cache..."
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "⚙️ Executando build final otimizado..."
npm run build
