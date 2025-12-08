# UltraFix-Mapa360-PRO.ps1
# Cria e corrige automaticamente toda a estrutura do mapa no Next.js
# Resolve erros de SSR, rebuild, importação dinâmica e Leaflet.

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando UltraFix-Mapa 360º PRO..." -ForegroundColor Green
Write-Host "=====================================`n" -ForegroundColor Cyan

# ==============================
# 1) DEFINIR CAMINHOS
# ==============================
$ProjectPath = "C:\Users\Administrador\pecuariatech"
$MapaPath = Join-Path $ProjectPath "app\mapa"

Write-Host "📌 Projeto: $ProjectPath"
Write-Host "📌 Pasta do mapa: $MapaPath`n"

# ==============================
# 2) CRIAR PASTA /app/mapa SE NÃO EXISTIR
# ==============================
if (-Not (Test-Path $MapaPath)) {
    Write-Host "📁 Criando pasta /app/mapa..."
    New-Item -Path $MapaPath -ItemType Directory | Out-Null
} else {
    Write-Host "📁 Pasta /app/mapa já existe."
}

# ==============================
# 3) CRIAR page.tsx (IMPORTAÇÃO DINÂMICA)
# ==============================
$PageTSX = @'
"use client";

import dynamic from "next/dynamic";

const MapaView = dynamic(() => import("./view"), {
  ssr: false,
});

export default function Page() {
  return <MapaView />;
}
'@

Set-Content -Path (Join-Path $MapaPath "page.tsx") -Value $PageTSX -Encoding UTF8
Write-Host "📝 Arquivo page.tsx criado com sucesso."

# ==============================
# 4) CRIAR view.tsx (LEAFLET SOMENTE CLIENTE)
# ==============================
$ViewTSX = @'
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Ícones do Leaflet corrigidos
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function ViewMapa() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <MapContainer
        center={[-10.0, -55.0]}
        zoom={4}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[-10.0, -55.0]}>
          <Popup>Mapa carregado com sucesso! 🚀</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
'@

Set-Content -Path (Join-Path $MapaPath "view.tsx") -Value $ViewTSX -Encoding UTF8
Write-Host "📝 Arquivo view.tsx criado com sucesso."

# ==============================
# 5) FINALIZAÇÃO
# ==============================
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "✔ UltraFix-Mapa 360º PRO finalizado!" -ForegroundColor Green
Write-Host "👉 Agora faça REDEPLOY no Vercel." -ForegroundColor Yellow
Write-Host "👉 Depois acesse: https://www.pecuariatech.com/mapa" -ForegroundColor Yellow
Write-Host "=====================================`n" -ForegroundColor Cyan
