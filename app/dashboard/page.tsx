"use client";

import { getKPIs } from "../lib/kpis";

export default async function DashboardPage() {
  const kpis = await getKPIs();

  return (
    <main className="space-y-10">
      <h1 className="text-4xl font-bold text-green-700">
        📊 PecuariaTech UltraDashboard
      </h1>

      {/* Hero sem imagem remota */}
      <div className="bg-green-200 rounded-xl p-10 shadow text-xl font-semibold">
        🌱 Produção sustentável e inteligente
      </div>

      <section className="grid grid-cols-2 gap-6">
        <div className="border p-6 rounded-xl shadow bg-white">
          <h2 className="font-semibold">🧬 Total Animais</h2>
          <p className="text-2xl">{kpis.totalAnimais}</p>
        </div>

        <div className="border p-6 rounded-xl shadow bg-white">
          <h2 className="font-semibold">🌾 Pastagem</h2>
          <p className="text-2xl">{kpis.pastagemDisponivel} ha</p>
        </div>

        <div className="border p-6 rounded-xl shadow bg-white">
          <h2 className="font-semibold">🔥 Status Biológico</h2>
          <p className="text-2xl">{kpis.statusBiologico}</p>
        </div>

        <div className="border p-6 rounded-xl shadow bg-white">
          <h2 className="font-semibold">⚠️ Risco Nutricional</h2>
          <p className="text-2xl">{kpis.riscoNutricional}</p>
        </div>
      </section>
    </main>
  );
}
