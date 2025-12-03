# Fix-Mapa-V3-AutoPatch.ps1
# Script único para:
# 1. Corrigir automaticamente o erro do Leaflet (LatLngTuple)
# 2. Atualizar o componente Mapa.tsx para a versão PRO V3
# 3. Rodar build e avisar se há sucesso ou falha

Write-Host "🔧 Iniciando AutoPatch do Mapa PecuariaTech..." -ForegroundColor Cyan

$arquivo = "C:\Users\Administrador\pecuariatech\components\Mapa.tsx"

if (-Not (Test-Path $arquivo)) {
    Write-Host "❌ ERRO: Arquivo Mapa.tsx não encontrado!" -ForegroundColor Red
    exit
}

Write-Host "📄 Corrigindo arquivo Mapa.tsx..." -ForegroundColor Yellow

# Conteúdo corrigido + versão PRO V3 com marcador e popup
$conteudo = @"
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";

// Ícone customizado (PecuariaTech Marker)
const cowIcon = L.icon({
  iconUrl: "/cow-marker.png", // pode mudar depois
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

export default function Mapa() {
  // CORREÇÃO OFICIAL (LatLngTuple)
  const center: LatLngTuple = [-15.7801, -47.9292];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-green-700">🌾 Mapa das Pastagens — Versão PRO V3</h2>

      <MapContainer center={center} zoom={6} style={{ height: "430px", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcador central */}
        <Marker position={center} icon={cowIcon}>
          <Popup>
            📍 <b>PecuariaTech</b><br />
            Centro do Brasil — Controle Inteligente.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
"@

Set-Content -Path $arquivo -Value $conteudo -Encoding UTF8

Write-Host "✅ Mapa.tsx atualizado para Versão PRO V3!" -ForegroundColor Green

Write-Host "📦 Rodando build para validar..." -ForegroundColor Yellow

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 BUILD OK! Sistema pronto para deploy." -ForegroundColor Green
} else {
    Write-Host "❌ ERRO NO BUILD! Veja o log acima." -ForegroundColor Red
}
