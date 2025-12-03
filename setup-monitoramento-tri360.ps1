# ─────────────────────────────────────────────────────────────
#  PecuariaTech · Monitoramento Tri360 Ω+ (Next.js 15 + Recharts)
#  PowerShell 7 – cria arquivos, instala deps e inicia o dev
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$root = "C:\Users\Administrador\pecuariatech"

function Write-Utf8NoBom($path, $text) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $enc)
}

function Ensure-Dir($p) { if (-not (Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }

Write-Host "🔧 Iniciando setup do painel /monitoramento..." -ForegroundColor Cyan
Set-Location $root

# 1) Pastas
Ensure-Dir "$root\data"
Ensure-Dir "$root\app\api\ultra\stats"
Ensure-Dir "$root\app\monitoramento"

# 2) tri360_state.json (dados de exemplo / será atualizado pelo seu script Tri360 terminal)
$stateJson = @"
{
  "alpha": 0.999,
  "beta": 0.790,
  "gamma": 0.848,
  "omega": 0.904,
  "threshold": 0.87,
  "cycle": 31,
  "last_update": "17:00:52",
  "history": [0.872, 0.868, 0.871, 0.869, 0.875, 0.880, 0.883, 0.890, 0.895, 0.904]
}
"@
Write-Utf8NoBom "$root\data\tri360_state.json" $stateJson
Write-Host "✅ data/tri360_state.json criado."

# 3) API /app/api/ultra/stats/route.ts
$apiRoute = @"
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "tri360_state.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "STATE_NOT_FOUND", detail: String(e) }, { status: 500 });
  }
}
"@
Write-Utf8NoBom "$root\app\api\ultra\stats\route.ts" $apiRoute
Write-Host "✅ API /app/api/ultra/stats/route.ts criada."

# 4) Página /app/monitoramento/page.tsx
$page = @"
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type Tri360State = {
  alpha: number;
  beta: number;
  gamma: number;
  omega: number;
  threshold: number;
  cycle: number;
  last_update: string;
  history: number[];
};

function TrendIcon({ prev, curr }: { prev?: number; curr?: number }) {
  if (prev === undefined || curr === undefined) return null;
  if (curr > prev) return <span className="text-emerald-600">▲</span>;
  if (curr < prev) return <span className="text-red-600">▼</span>;
  return <span className="text-gray-400">■</span>;
}

export default function Monitoramento() {
  const [data, setData] = useState<Tri360State | null>(null);
  const [prevOmega, setPrevOmega] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // beep inline (base64) para alerta Ω abaixo do threshold
  const beepSrc = useMemo(() => {
    // tom simples ~1kHz; curta duração
    return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAACAgICAAACAgICAgP8AAP8A/wD/AAAAAP8A/wAA';
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ultra/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json: Tri360State = await res.json();
      setError(null);
      setPrevOmega((p) => (data?.omega ?? p));
      setData(json);

      if (json.omega < json.threshold) {
        // alerta sonoro
        if (!audioRef.current) {
          const a = new Audio(beepSrc);
          audioRef.current = a;
        }
        audioRef.current!.currentTime = 0;
        audioRef.current!.play().catch(() => {});
      }
    } catch (e: any) {
      setError(String(e));
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) {
    return <div className="p-6 text-gray-500">Carregando dados do Tri360 Ω...</div>;
  }

  const chartData = (data.history ?? []).map((val, idx) => ({
    cycle: data.cycle - (data.history?.length ?? 0) + idx + 1,
    omega: val
  }));

  const isStable = data.omega >= data.threshold;

  return (
    <div className="p-6 space-y-6">
      <audio ref={audioRef} src={beepSrc} preload="auto" />
      <h1 className="text-3xl font-bold flex items-center gap-2">
        🌐 Monitoramento Tri360 <span className="text-gray-500 text-lg">Ω+</span>
      </h1>
      <p className="text-gray-500 -mt-2">Ciclo contínuo α → β → γ → Ω — Autoaprendizado Fractal</p>
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">Falha ao ler estado: {error}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { k: 'alpha', label: 'α — Criação', color: 'text-emerald-600' },
          { k: 'beta',  label: 'β — Otimização', color: 'text-blue-600' },
          { k: 'gamma', label: 'γ — Integração', color: 'text-purple-600' },
          { k: 'omega', label: 'Ω — Estabilidade', color: isStable ? 'text-emerald-600' : 'text-red-600' }
        ].map(({ k, label, color }) => (
          <div key={k} className={\`p-4 rounded-lg shadow border \${k==='omega' ? (isStable ? 'border-emerald-300' : 'border-red-400 animate-pulse') : 'border-gray-200'} bg-white\`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={\`text-2xl font-bold \${color} flex items-center gap-2\`}>
              {(data as any)[k].toFixed(3)}
              {k==='omega' && <TrendIcon prev={prevOmega} curr={data.omega} />}
            </p>
            {k==='omega' && !isStable && <p className="text-xs text-red-600">Atenção: abaixo do limiar ({data.threshold.toFixed(2)})</p>}
          </div>
        ))}
      </div>

      {/* Gráfico Ω */}
      <div className="p-4 rounded-lg shadow bg-white">
        <h2 className="text-lg font-semibold mb-2">Ω — Últimos Ciclos</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cycle" />
            <YAxis domain={[0.6, 1]} />
            <Tooltip />
            <Line type="monotone" dataKey="omega" stroke="#10b981" strokeWidth={3} dot={{ r: 2 }} />
            {/* Linha de threshold */}
            <Line
              type="monotone"
              dataKey={() => data.threshold}
              stroke="#f59e0b"
              strokeDasharray="6 6"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status */}
      <div className="p-4 rounded-lg shadow bg-gray-50 border border-gray-200">
        <p>
          Status geral:{' '}
          <span className={\`font-bold \${isStable ? 'text-emerald-700' : 'text-red-600'}\`}>
            {isStable ? 'Estável' : 'Oscilação Detectada'}
          </span>
        </p>
        <p>Ciclo atual: <strong>{data.cycle}</strong></p>
        <p>Limiar (threshold): <strong>{data.threshold.toFixed(2)}</strong></p>
        <p>Última atualização: <strong>{data.last_update}</strong></p>
      </div>
    </div>
  );
}
"@
Write-Utf8NoBom "$root\app\monitoramento\page.tsx" $page
Write-Host "✅ Página /app/monitoramento/page.tsx criada."

# 5) Dependências
Write-Host "📦 Instalando dependências Recharts..." -ForegroundColor Yellow
npm install recharts --legacy-peer-deps | Out-Null

# 6) Dica final
Write-Host ""
Write-Host "✅ Tudo pronto!"
Write-Host "▶ Agora rode:  npm run dev" -ForegroundColor Green
Write-Host "e acesse:      http://localhost:3000/monitoramento"
