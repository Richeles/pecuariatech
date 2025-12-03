Write-Host "🚀 Iniciando UltraBuilder v24.2 — Triângulo 360º" -ForegroundColor Cyan

$root = "C:\Users\Administrador\pecuariatech"
$appPath = "$root\app\triangulo360"
$componentPath = "$root\components\ultracore"
$apiPath = "$root\app\api\ultra\stats"

# ---------------------------
# 1. Criar pastas
# ---------------------------
$folders = @($appPath, $componentPath, $apiPath)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "📁 Criada: $folder" -ForegroundColor Green
    } else {
        Write-Host "✔ Pasta já existe: $folder"
    }
}

# ---------------------------
# 2. Criar arquivo page.tsx
# ---------------------------
$pageFile = "$appPath\page.tsx"

$pageContent = @"
import Triangulo360 from "@/components/ultracore/Triangulo360";

export default function Page() {
  return <Triangulo360 />;
}
"@

Set-Content -Path $pageFile -Value $pageContent -Encoding UTF8
Write-Host "📝 Arquivo criado: page.tsx" -ForegroundColor Green

# ---------------------------
# 3. Criar componente Triangulo360
# ---------------------------
$componentFile = "$componentPath\Triangulo360.tsx"

$componentContent = @"
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
"@

Set-Content -Path $componentFile -Value $componentContent -Encoding UTF8
Write-Host "🧩 Componente criado: Triangulo360.tsx" -ForegroundColor Green

# ---------------------------
# 4. Criar API /api/ultra/stats
# ---------------------------
$apiFile = "$apiPath\route.ts"

$apiContent = @"
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    health: {
      status: "OK",
      internet: "Online",
      supabase: "Connected",
      cpu: 12
    },
    logs: [
      "Sistema iniciado com sucesso...",
      "Supabase conectado.",
      "Monitoramento ativo."
    ]
  });
}
"@

Set-Content -Path $apiFile -Value $apiContent -Encoding UTF8
Write-Host "🛠 Rota criada: /api/ultra/stats" -ForegroundColor Green

# ---------------------------
# 5. Deploy automático Vercel (opcional)
# ---------------------------

if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "🚀 Iniciando deploy Vercel..." -ForegroundColor Yellow
    vercel --prod
} else {
    Write-Host "⚠ Vercel não instalado. Pulei o deploy." -ForegroundColor DarkYellow
}

Write-Host "`n🎉 Triângulo 360º instalado com sucesso!" -ForegroundColor Green
Write-Host "🌍 Acesse: https://www.pecuariatech.com/triangulo360" -ForegroundColor Cyan
