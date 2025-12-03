<#
PecuariaTech Frontend Setup - v6.2 CloudLite
Cria estrutura Next.js interativa com Supabase, Recharts e Leaflet.
Compatível com ambiente de baixa memória e cloud-first.
#>

$root = "C:\Users\Administrador\pecuariatech"
Write-Host "🚀 Iniciando Setup PecuariaTech Frontend v6.2..." -ForegroundColor Cyan

# === 1. Cria pastas principais ===
$folders = @("components", "lib", "pages", "pages\api", "styles")
foreach ($folder in $folders) {
    $path = Join-Path $root $folder
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Write-Host "📁 Criada pasta: $folder"
    }
}

# === 2. Cria o arquivo de conexão Supabase ===
$libFile = Join-Path $root "lib\supabase-browser.ts"
@"
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
"@ | Out-File -Encoding utf8 $libFile
Write-Host "🔗 Arquivo de conexão Supabase criado: lib\supabase-browser.ts"

# === 3. Cria o componente Dashboard ===
$dashboardFile = Join-Path $root "components\Dashboard.tsx"
@"
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-browser'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState([])

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase.from('financeiro').select('*')
      if (!error && data) setData(data)
    }
    loadData()
  }, [])

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-green-700">💹 Dashboard Financeiro</h2>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="data" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="valor" stroke="#16a34a" strokeWidth={2} />
      </LineChart>
    </div>
  )
}
"@ | Out-File -Encoding utf8 $dashboardFile
Write-Host "📊 Componente Dashboard criado."

# === 4. Cria o componente Mapa (Leaflet) ===
$mapaFile = Join-Path $root "components\Mapa.tsx"
@"
'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function Mapa() {
  const center = [-20.5, -54.6] // Campo Grande (MS)
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-green-700">🌾 Mapa das Pastagens</h2>
      <MapContainer center={center} zoom={6} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={center}>
          <Popup>📍 Fazenda Central - PecuariaTech</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
"@ | Out-File -Encoding utf8 $mapaFile
Write-Host "🗺️ Componente Mapa criado."

# === 5. Cria a página principal ===
$indexFile = Join-Path $root "pages\index.tsx"
@"
import Dashboard from '../components/Dashboard'
import Mapa from '../components/Mapa'

export default function Home() {
  return (
    <main className="min-h-screen bg-green-50 p-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
        🌿 PecuariaTech Cloud v6.2
      </h1>
      <Dashboard />
      <Mapa />
    </main>
  )
}
"@ | Out-File -Encoding utf8 $indexFile
Write-Host "🏠 Página inicial criada: pages/index.tsx"

# === 6. Finalização ===
Write-Host "`n✅ Setup completo!" -ForegroundColor Green
Write-Host "Agora execute:" -ForegroundColor Yellow
Write-Host "1️⃣ cd C:\Users\Administrador\pecuariatech"
Write-Host "2️⃣ npm run dev"
Write-Host "Depois abra: http://localhost:3000 🌎"
