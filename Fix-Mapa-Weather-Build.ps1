Write-Host "🔧 Iniciando UltraFix (Mapa + Clima)..." -ForegroundColor Cyan

$mapa = "C:\Users\Administrador\pecuariatech\components\Mapa.tsx"
$weather = "C:\Users\Administrador\pecuariatech\components\SmartWeather.tsx"

# ------------------------------
# 🧩 CORREÇÃO DO SMARTWEATHER (ERRO DO ${temp})
# ------------------------------
Write-Host "🌦️ Corrigindo SmartWeather.tsx..." -ForegroundColor Yellow

$novoWeather = @"
import React from 'react';

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
"@

Set-Content -Path $weather -Value $novoWeather -Encoding UTF8
Write-Host "✅ SmartWeather.tsx corrigido!" -ForegroundColor Green

# ------------------------------
# 🗺️ CORREÇÃO DO MAPA (CONFIRMANDO V3)
# ------------------------------
Write-Host "🗺️ Atualizando Mapa.tsx (V3)..." -ForegroundColor Yellow

$novoMapa = @"
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const center: [number, number] = [-15.7801, -47.9292];

const cowIcon = new L.Icon({
  iconUrl: "/cow-marker.png",
  iconSize: [45, 45],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

export default function Mapa() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-green-700">🌾 Mapa das Pastagens</h2>

      <MapContainer center={center} zoom={6} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center} icon={cowIcon}>
          <Popup>PecuariaTech — Centro de Operações</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
"@

Set-Content -Path $mapa -Value $novoMapa -Encoding UTF8
Write-Host "✅ Mapa.tsx atualizado!" -ForegroundColor Green

# ------------------------------
# 🧪 BUILD
# ------------------------------
Write-Host "📦 Rodando build para validar..." -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 BUILD OK! — pronto para deploy." -ForegroundColor Green
} else {
    Write-Host "❌ ERRO NO BUILD — veja o log acima!" -ForegroundColor Red
}
