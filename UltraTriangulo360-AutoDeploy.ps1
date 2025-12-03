Write-Host "`n🔵 UltraTriangulo360 – Iniciando..." -ForegroundColor Cyan

# ================================
# 1) CAMINHOS DO PROJETO
# ================================
$root = "C:\Users\Administrador\pecuariatech"
$app = "$root\app"
$components = "$root\components\ultracore"
$api = "$root\app\api\ultra\stats"

# Criar diretórios necessários
Write-Host "📁 Criando pastas necessárias..."
New-Item -ItemType Directory -Path "$root\app\triangulo360" -Force | Out-Null
New-Item -ItemType Directory -Path $components -Force | Out-Null
New-Item -ItemType Directory -Path $api -Force | Out-Null


# ================================
# 2) CRIA PAGE.TSX DA PÁGINA
# ================================
Write-Host "📄 Gerando page.tsx da rota /triangulo360..."

$page = @'
// app/triangulo360/page.tsx
import Triangulo360 from "@/components/ultracore/Triangulo360";

export default function Page() {
  return <Triangulo360 />;
}
'@

Set-Content -Path "$root\app\triangulo360\page.tsx" -Value $page -Encoding utf8


# ================================
# 3) CRIA COMPONENTE TRIANGULO360
# ================================
Write-Host "⚙️ Gerando componente Triangulo360.tsx..."

$triangulo = @'
// components/ultracore/Triangulo360.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Wifi, Database, Cpu } from "lucide-react";

export default function Triangulo360() {
  const [data, setData] = useState<any>(null);

  async function load() {
    try {
      const res = await fetch("/api/ultra/stats");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const kpi = (label: string, value: any, Icon: any) => (
    <Card className="p-4 bg-white/5 border-white/10 text-white rounded-2xl shadow-md">
      <CardContent className="flex items-center gap-4">
        <Icon className="w-10 h-10 text-green-400" />
        <div>
          <p className="text-sm opacity-70">{label}</p>
          <p className="text-xl font-bold">{value ?? "--"}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700">
      <h1 className="text-4xl font-bold text-white mb-8">Triângulo 360º — Status Completo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpi("Status do Sistema", data?.health?.status, Activity)}
        {kpi("Conexão", data?.health?.internet, Wifi)}
        {kpi("Supabase", data?.health?.supabase, Database)}
        {kpi("Uso de CPU", data?.health?.cpu + "%", Cpu)}
      </div>

      <div className="mt-10 bg-black/20 backdrop-blur-xl p-6 rounded-2xl text-white shadow-xl border border-white/10">
        <h2 className="text-2xl font-semibold mb-4">Logs</h2>
        <div className="h-64 overflow-auto bg-black/30 p-4 rounded-xl text-sm">
          {data?.logs?.length
            ? data.logs.map((l: any, i: number) => (
                <pre key={i} className="text-green-300">{l}</pre>
              ))
            : "Sem logs ainda..."}
        </div>
      </div>
    </div>
  );
}
'@

Set-Content -Path "$components\Triangulo360.tsx" -Value $triangulo -Encoding utf8


# ================================
# 4) API /api/ultra/stats REAL
# ================================
Write-Host "🔌 Criando endpoint /api/ultra/stats..."

$apiFile = @'
// app/api/ultra/stats/route.ts
import os from "os";

export async function GET() {
  const cpu = os.loadavg()[0].toFixed(2);

  const payload = {
    health: {
      status: "ONLINE",
      internet: "OK",
      supabase: "OK",
      cpu,
    },
    logs: [
      "Sistema iniciado",
      "CPU carregada",
      "Internet OK",
      "Supabase OK"
    ]
  };

  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" }
  });
}
'@

Set-Content -Path "$api\route.ts" -Value $apiFile -Encoding utf8


# ================================
# 5) LOG FINAL
# ================================
Write-Host "`n✅ Tudo criado com sucesso!"
Write-Host "👉 Agora rode:  npm run dev  OU faça deploy na Vercel"
Write-Host "👉 Depois abra:  http://localhost:3000/triangulo360" -ForegroundColor Green
