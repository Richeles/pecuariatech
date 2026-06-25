"use client";

import { useDashboard } from "../DashboardContext";

export default function RebanhoPage() {
  const { data, loading } = useDashboard();

  if (loading) {
    return <div className="animate-pulse text-[#A7F3D0]/60">Carregando dados do rebanho...</div>;
  }

  const quantidade = data?.quantidade || 0;
  const pesoMedio = data?.peso_medio || 0;
  const gmd = data?.gmd || 0;
  const scorePi = data?.score_pi || 0;
  const risco = data?.risco_estrutural || "N/D";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Central PecuariaTech – Rebanho</h1>
      <p className="text-[#A7F3D0]/60">Rastreamento inteligente e governança biológica</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-[#34D399]/20">
          <p className="text-sm text-[#A7F3D0]/50">Quantidade</p>
          <p className="text-2xl font-bold text-white">{quantidade}</p>
        </div>
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-[#34D399]/20">
          <p className="text-sm text-[#A7F3D0]/50">Peso Médio (kg)</p>
          <p className="text-2xl font-bold text-white">{pesoMedio.toFixed(1)}</p>
        </div>
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-[#34D399]/20">
          <p className="text-sm text-[#A7F3D0]/50">GMD (kg/dia)</p>
          <p className="text-2xl font-bold text-white">{gmd.toFixed(3)}</p>
        </div>
        <div className={`bg-[#1A3F2A]/60 rounded-2xl p-6 border ${risco === "baixo" ? "border-green-500/20" : risco === "moderado" ? "border-yellow-500/20" : "border-red-500/20"}`}>
          <p className="text-sm text-[#A7F3D0]/50">Risco</p>
          <p className={`text-2xl font-bold ${risco === "baixo" ? "text-green-400" : risco === "moderado" ? "text-yellow-400" : "text-red-400"}`}>{risco.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}