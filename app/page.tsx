"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import UltraSimbioViz from './components/UltraSimbioViz';
import { Chart } from 'react-chartjs-2';

interface KPI {
  rebanho: number;
  pastagem: number;
  financeiro: number;
}

interface RebanhoItem {
  id: number;
  nome: string;
  raca: string;
  quantidade: number;
}

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [rebanho, setRebanho] = useState<RebanhoItem[]>([]);
  const [financeData, setFinanceData] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: kpiData } = await supabase.from("dashboard_kpi").select("*").limit(1).single();
      if(kpiData) setKpi(kpiData);

      const { data: alertsData } = await supabase.from("alerts").select("message").order("created_at", { ascending: false }).limit(5);
      if(alertsData) setAlerts(alertsData.map(a => a.message));

      const { data: rebanhoData } = await supabase.from("rebanho").select("*");
      if(rebanhoData) setRebanho(rebanhoData);

      const { data: finData } = await supabase.from("financeiro").select("valor").order("mes", { ascending: true });
      if(finData) setFinanceData(finData.map(f => f.valor));
    }

    fetchData();
  }, []);

  const financeChartData = {
    labels: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
    datasets: [{
      label: "Financeiro (R$)",
      data: financeData,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderColor: "#fff",
      borderWidth: 2,
    }]
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">🌾 PecuariaTech - Triângulo 360º</h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-800 p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">Área total (ha)</h2>
          <p className="text-3xl mt-2">{kpi?.pastagem ?? "..."}</p>
        </div>
        <div className="bg-green-800 p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">Cabeças de gado</h2>
          <p className="text-3xl mt-2">{kpi?.rebanho ?? "..."}</p>
        </div>
        <div className="bg-green-800 p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">Saldo (R$)</h2>
          <p className="text-3xl mt-2">{kpi?.financeiro ? "R$ " + kpi.financeiro.toLocaleString() : "..."}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Raças</h2>
        <p>Nelore · Angus · Brahman</p>
      </section>

      <section className="mb-8 bg-green-800 p-4 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Gráfico Financeiro</h2>
        {financeData.length > 0 ? <Chart type="line" data={financeChartData} /> : <p>Carregando...</p>}
      </section>

      <section className="mb-8 bg-green-800 p-4 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Tabela de Rebanho</h2>
        {rebanho.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b border-white p-2">Nome</th>
                <th className="border-b border-white p-2">Raça</th>
                <th className="border-b border-white p-2">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {rebanho.map((item) => (
                <tr key={item.id}>
                  <td className="border-b border-white p-2">{item.nome}</td>
                  <td className="border-b border-white p-2">{item.raca}</td>
                  <td className="border-b border-white p-2">{item.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>Carregando...</p>}
      </section>

      <UltraSimbioViz />

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

      <footer className="text-center mt-8">
        © 2025 PecuariaTech
      </footer>
    </main>
  );
}
