# -----------------------------------------------
# Ultra360º Triângulo - PowerShell Script Único
# -----------------------------------------------

# 1️⃣ Configuração de variáveis de ambiente
$env:NEXT_PUBLIC_SUPABASE_URL = "https://SEU_SUPABASE_URL.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "SEU_SUPABASE_ANON_KEY"

Write-Host "✅ Variáveis de ambiente do Supabase definidas."

# 2️⃣ Limpar cache do Next.js
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "🧹 Cache .next limpo."
}

# 3️⃣ Liberar porta 3000 no Windows Firewall
netsh advfirewall firewall add rule name="Node3000-In" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Node3000-Out" dir=out action=allow protocol=TCP localport=3000
Write-Host "✅ Porta 3000 liberada no firewall."

# 4️⃣ Criar tabelas e inserir dados no Supabase via CLI
# ⚠️ Necessário supabase CLI instalada e logada

Write-Host "🚀 Criando tabelas no Supabase..."

# Tabela dashboard_kpi
supabase db query @"
create table if not exists dashboard_kpi (
    id uuid primary key default gen_random_uuid(),
    rebanho int,
    pastagem int,
    financeiro numeric
);
"@

supabase db query @"
insert into dashboard_kpi (rebanho, pastagem, financeiro)
values (1200, 45, 150000)
on conflict (id) do nothing;
"@

# Tabela alerts
supabase db query @"
create table if not exists alerts (
    id uuid primary key default gen_random_uuid(),
    message text,
    created_at timestamp default now()
);
"@

supabase db query @"
insert into alerts (message)
values
('Rebanho atualizado'),
('Pastagem com nível crítico'),
('Novo relatório financeiro disponível')
on conflict (id) do nothing;
"@

Write-Host "✅ Tabelas criadas e dados de teste inseridos."

# 5️⃣ Criar UltraDashboard v5 (Client Component)
$AppPath = "C:\Users\Administrador\pecuariatech\app"
if (!(Test-Path $AppPath)) { New-Item -ItemType Directory -Path $AppPath }

$PageFile = Join-Path $AppPath "page.tsx"

$DashboardCode = @"
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface KPI {
  rebanho: number;
  pastagem: number;
  financeiro: number;
}

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: kpiData } = await supabase.from("dashboard_kpi").select("*").limit(1).single();
      if(kpiData) setKpi(kpiData);

      const { data: alertsData } = await supabase.from("alerts").select("message").order("created_at", { ascending: false }).limit(5);
      if(alertsData) setAlerts(alertsData.map(a => a.message));
    }

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ultra360º Dashboard</h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-800 p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">Rebanho</h2>
          <p className="text-3xl mt-2">{kpi?.rebanho ?? "..."}</p>
        </div>
        <div className="bg-green-800 p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">Pastagem</h2>
          <p className="text-3xl mt-2">{kpi?.pastagem ?? "..."}</p>
        </div>
        <div className="bg-green-800 p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">Financeiro</h2>
          <p className="text-3xl mt-2">{kpi?.financeiro ? "R$ " + kpi.financeiro : "..."}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Alertas</h2>
        <ul className="space-y-2">
          {alerts.length === 0 ? (
            <li className="bg-red-700 p-3 rounded-lg shadow">Carregando...</li>
          ) : (
            alerts.map((a, idx) => (
              <li key={idx} className="bg-red-700 p-3 rounded-lg shadow">{a}</li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
"@

Set-Content -Path $PageFile -Value $DashboardCode -Encoding UTF8
Write-Host "✅ Ultra360º Dashboard criado em app/page.tsx"

# 6️⃣ Rodar Next.js localmente
Write-Host "🚀 Iniciando Next.js localmente..."
npm run dev -- -H 0.0.0.0

# 7️⃣ Deploy automático na Vercel
Write-Host "🌐 Deploy automático na Vercel..."
vercel --prod --confirm
Write-Host "✅ Ultra360º Dashboard implantado com sucesso!"
