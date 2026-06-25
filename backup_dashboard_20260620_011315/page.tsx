"use client";

// ============================================================
// PECUARIATECH – CFO INTELIGENTE
// DADOS REAIS VIA DashboardProvider (global)
// ============================================================

import { useDashboard } from "../DashboardContext";

export default function CFOPage() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[#A7F3D0]/60">Carregando dados financeiros cognitivos...</div>
      </div>
    );
  }

  // Dados reais do DTO
  const receita = data?.receita || 0;
  const despesa = data?.despesa || 0;
  const lucro = receita - despesa;
  const margem = data?.margem || 0;
  const roi = data?.roi || 0;
  const ebitda = data?.ebitda || 0;
  const risco = data?.risco_estrutural || "N/D";

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">CFO Inteligente</h1>
        <p className="text-[#A7F3D0]/60">Análise financeira cognitiva com dados em tempo real</p>
      </div>

      {/* KPI GRID – 6 CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-[#34D399]/20">
          <p className="text-sm text-[#A7F3D0]/50">Receita Total</p>
          <p className="text-2xl font-bold text-white">R$ {receita.toLocaleString()}</p>
        </div>
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-red-500/20">
          <p className="text-sm text-[#A7F3D0]/50">Despesas Totais</p>
          <p className="text-2xl font-bold text-white">R$ {despesa.toLocaleString()}</p>
        </div>
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-[#34D399]/20">
          <p className="text-sm text-[#A7F3D0]/50">Lucro / Prejuízo</p>
          <p className={`text-2xl font-bold ${lucro >= 0 ? 'text-[#34D399]' : 'text-red-400'}`}>
            R$ {lucro.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-[#34D399]/20">
          <p className="text-sm text-[#A7F3D0]/50">Margem</p>
          <p className="text-2xl font-bold text-white">{margem.toFixed(1)}%</p>
        </div>
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-[#34D399]/20">
          <p className="text-sm text-[#A7F3D0]/50">ROI</p>
          <p className="text-2xl font-bold text-white">{roi.toFixed(1)}%</p>
        </div>
        <div className="bg-[#1A3F2A]/60 rounded-2xl p-6 border border-[#34D399]/20">
          <p className="text-sm text-[#A7F3D0]/50">EBITDA</p>
          <p className="text-2xl font-bold text-white">R$ {ebitda.toLocaleString()}</p>
        </div>
      </div>

      {/* CFO COGNITIVO BIOFINANCEIRO */}
      <div className="bg-[#1A3F2A]/40 rounded-2xl p-6 border border-[#34D399]/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#A7F3D0]/60 uppercase tracking-wider">
              CFO Cognitivo BioFinanceiro
            </h3>
            <p className="text-[#A7F3D0]/40 text-sm mt-2 max-w-2xl">
              O runtime financeiro opera sobre governança semântica, integrado ao Motor π, ICBC 360 e inteligência operacional biofinanceira do PecuariaTech.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            risco === "baixo" ? "bg-green-500/20 text-green-400" :
            risco === "moderado" ? "bg-yellow-500/20 text-yellow-400" :
            "bg-red-500/20 text-red-400"
          }`}>
            Risco: {risco.toUpperCase()}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#A7F3D0]/30">
          <span>✅ Score π: {data?.score_pi?.toFixed(1) ?? 0}</span>
          <span>✅ Capital Score: {data?.capital_score?.toFixed(1) ?? 0}</span>
          <span>✅ GMD: {data?.gmd?.toFixed(3) ?? 0} kg/dia</span>
          <span>✅ Lotação: {data?.lotacao?.toFixed(2) ?? 0} UA/ha</span>
        </div>
      </div>

      {/* FOOTER – SUGESTÕES RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-[#0F2A1A]/60 rounded-xl p-4 border border-[#34D399]/10">
          <p className="text-[#A7F3D0]/40">💡 Recomendação Estratégica</p>
          <p className="text-[#A7F3D0]/70 mt-1">
            {lucro > 0 
              ? "Operação gerando lucro positivo. Considere reinvestir em áreas com maior ROI."
              : "Operação com prejuízo. Revisar estrutura de custos e alocação de capital."}
          </p>
        </div>
        <div className="bg-[#0F2A1A]/60 rounded-xl p-4 border border-[#34D399]/10">
          <p className="text-[#A7F3D0]/40">📊 Indicador Chave</p>
          <p className="text-[#A7F3D0]/70 mt-1">
            {roi > 50 
              ? "ROI acima de 50% – performance financeira excelente."
              : roi > 20 
              ? "ROI entre 20% e 50% – desempenho satisfatório."
              : "ROI abaixo de 20% – oportunidade de melhoria."}
          </p>
        </div>
      </div>
    </div>
  );
}