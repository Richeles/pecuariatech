"use client";

import { useDashboard } from "../../DashboardContext";

export default function FinanceiroClient() {
  const { data, loading } = useDashboard();

  // Dados reais do DTO
  const roi = data?.roi ?? 0;
  const margem = data?.margem ?? 0;
  const ebitda = data?.ebitda ?? 0;
  const scorePi = data?.score_pi ?? 0;
  const capitalScore = data?.capital_score ?? 0;
  const risco = data?.risco_estrutural?.toUpperCase() ?? "N/D";

  if (loading) {
    return <div className="p-10 text-slate-500">Carregando dados financeiros...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-[40px] border border-emerald-500/20 bg-gradient-to-br from-[#03140d] via-[#072117] to-[#0b2d1f] p-10">
        <h1 className="text-4xl font-black text-white">Financeiro Inteligente</h1>
        <p className="mt-2 text-emerald-100/80">Runtime financeiro cognitivo com dados em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">ROI</div>
          <div className="text-3xl font-black text-slate-900">{roi.toFixed(1)}%</div>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Margem</div>
          <div className="text-3xl font-black text-slate-900">{margem.toFixed(1)}%</div>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">EBITDA</div>
          <div className="text-3xl font-black text-slate-900">R$ {ebitda.toLocaleString()}</div>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Score π</div>
          <div className="text-3xl font-black text-slate-900">{scorePi.toFixed(1)}</div>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Capital Score</div>
          <div className="text-3xl font-black text-emerald-700">{capitalScore.toFixed(1)}</div>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Risco</div>
          <div className={`text-3xl font-black ${risco === "BAIXO" ? "text-green-600" : risco === "MODERADO" ? "text-yellow-600" : "text-red-600"}`}>{risco}</div>
        </div>
      </div>
    </section>
  );
}