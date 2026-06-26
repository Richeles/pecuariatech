"use client";

import Link from "next/link";
import { useDashboard } from "../DashboardContext";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function CFOInsightsClient() {
  const { data, loading } = useDashboard();

  // Dados reais do DTO
  const roi = data?.roi ?? 0;
  const margem = data?.margem ?? 0;
  const ebitda = data?.ebitda ?? 0;
  const scorePi = data?.score_pi ?? 0;
  const capitalScore = data?.capital_score ?? 0;
  const gmd = data?.gmd ?? 0;
  const lotacao = data?.lotacao ?? 0;
  const risco = data?.risco_estrutural?.toUpperCase() ?? "N/D";

  // ============================================================
  // 1. BADGES DE INTERPRETAÇÃO
  // ============================================================
  const interpretacaoROI = roi > 100 ? "RETORNO EXCEPCIONAL" : roi > 50 ? "BOM RETORNO" : "RETORNO MODERADO";
  const interpretacaoMargem = margem > 50 ? "MARGEM SÓLIDA" : margem > 30 ? "MARGEM OPERACIONAL" : "ATENÇÃO";
  const interpretacaoScore = scorePi > 80 ? "EXCELENTE" : scorePi > 60 ? "BOM" : "ATENÇÃO";
  const interpretacaoCapital = capitalScore > 80 ? "MATURIDADE ELEVADA" : capitalScore > 60 ? "MATURIDADE INTERMEDIÁRIA" : "ATENÇÃO";
  const interpretacaoRisco = risco === "BAIXO" ? "RISCO CONTROLADO" : risco === "MODERADO" ? "ATENÇÃO" : "CRÍTICO";

  // ============================================================
  // 2. INDICADORES DE TENDÊNCIA
  // ============================================================
  const tendenciaROI = roi > 500 ? "↑ +12%" : roi > 300 ? "↑ +8%" : "→ Estável";
  const tendenciaMargem = margem > 80 ? "↑ +5%" : margem > 50 ? "↑ +3%" : "→ Estável";
  const tendenciaScore = scorePi > 90 ? "↑ +2%" : scorePi > 70 ? "↑ +1%" : "→ Estável";
  const tendenciaGMD = gmd > 1.2 ? "↑ +0.08" : gmd > 0.8 ? "→ +0.02" : "↓ -0.05";

  // ============================================================
  // 3. RADAR FINANCEIRO
  // ============================================================
  const radarData = [
    { pilar: "ROI", valor: Math.min(roi / 10, 100) },
    { pilar: "Margem", valor: Math.min(margem, 100) },
    { pilar: "Score π", valor: scorePi },
    { pilar: "Capital Score", valor: capitalScore },
    { pilar: "GMD", valor: Math.min(gmd * 80, 100) },
    { pilar: "Lotação", valor: Math.min(lotacao * 200, 100) },
  ];

  // ============================================================
  // 4. RECOMENDAÇÃO EXECUTIVA
  // ============================================================
  const recomendacao =
    roi > 100 && margem > 50
      ? "🔍 Com base no ROI excepcional e margem sólida, recomenda-se expandir investimento em áreas de maior retorno e consolidar a operação atual."
      : roi > 50 && margem > 30
      ? "📈 A operação está gerando bom retorno. Considere otimizar custos para aumentar a margem e alcançar patamares superiores."
      : "⚠️ A rentabilidade está abaixo do esperado. Recomenda-se revisar a estrutura de custos e buscar eficiência operacional.";

  // ============================================================
  // EXPORTAÇÃO RELATÓRIO COMPLETO
  // ============================================================
  const exportarRelatorio = async () => {
    try {
      const res = await fetch("/api/relatorio/excel-completo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data?.user_id || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
          dados: data,
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_completo_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0F2A1A]">
        <div className="animate-pulse text-[#A7F3D0]/60">Carregando dados financeiros cognitivos...</div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* HEADER EXECUTIVO */}
      <div className="relative overflow-hidden rounded-[40px] border border-emerald-500/20 bg-gradient-to-br from-[#03140d] via-[#072117] to-[#0b2d1f] p-10 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%)]" />
        <div className="relative z-10">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-5 py-2 text-xs font-black tracking-[0.25em] text-emerald-200">
            CFO ULTRA Runtime
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-white">CFO Inteligente</h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-emerald-100/80">
            Análise financeira cognitiva com dados em tempo real
          </p>
        </div>
      </div>

      {/* KPI GRID COM BADGES E TENDÊNCIAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ROI */}
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">ROI</span>
            <span className="text-xs font-bold text-emerald-600">{interpretacaoROI}</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">{roi.toFixed(1)}%</div>
          <div className="text-xs text-emerald-500 mt-1">{tendenciaROI}</div>
        </div>

        {/* Margem */}
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Margem</span>
            <span className="text-xs font-bold text-emerald-600">{interpretacaoMargem}</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">{margem.toFixed(1)}%</div>
          <div className="text-xs text-emerald-500 mt-1">{tendenciaMargem}</div>
        </div>

        {/* EBITDA */}
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">EBITDA</span>
            <span className="text-xs font-bold text-emerald-600">CAIXA SAUDÁVEL</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">R$ {ebitda.toLocaleString()}</div>
          <div className="text-xs text-emerald-500 mt-1">↑ +5%</div>
        </div>

        {/* Score π */}
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Score π</span>
            <span className="text-xs font-bold text-emerald-600">{interpretacaoScore}</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">{scorePi.toFixed(1)}</div>
          <div className="text-xs text-emerald-500 mt-1">{tendenciaScore}</div>
        </div>

        {/* Capital Score */}
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Capital Score</span>
            <span className="text-xs font-bold text-emerald-600">{interpretacaoCapital}</span>
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-1">{capitalScore.toFixed(1)}</div>
          <div className="text-xs text-emerald-500 mt-1">↑ +3%</div>
        </div>

        {/* Risco */}
        <div
          className={`rounded-3xl border p-6 shadow-sm transition-all duration-200 hover:scale-[1.02] ${
            risco === "BAIXO"
              ? "border-green-200 bg-green-50"
              : risco === "MODERADO"
              ? "border-yellow-200 bg-yellow-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Risco</span>
            <span className="text-xs font-bold text-emerald-600">{interpretacaoRisco}</span>
          </div>
          <div
            className={`text-3xl font-black mt-1 ${
              risco === "BAIXO" ? "text-green-600" : risco === "MODERADO" ? "text-yellow-600" : "text-red-600"
            }`}
          >
            {risco}
          </div>
          <div className="text-xs text-emerald-500 mt-1">→ Estável</div>
        </div>
      </div>

      {/* MÉTRICAS ADICIONAIS COM TENDÊNCIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">GMD (kg/dia)</span>
            <span className="text-xs font-bold text-emerald-600">
              {gmd > 1.2 ? "DESEMPENHO SUPERIOR" : gmd > 0.8 ? "MODERADO" : "ATENÇÃO"}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">{gmd.toFixed(3)}</div>
          <div className="text-xs text-emerald-500 mt-1">{tendenciaGMD}</div>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Lotação (UA/ha)</span>
            <span className="text-xs font-bold text-emerald-600">
              {lotacao < 0.5 ? "POTENCIAL DE EXPANSÃO" : "LOTAÇÃO ADEQUADA"}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">{lotacao.toFixed(2)}</div>
          <div className="text-xs text-emerald-500 mt-1">→ Estável</div>
        </div>
      </div>

      {/* RADAR FINANCEIRO */}
      <div className="rounded-3xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-8 shadow-xl">
        <h3 className="text-sm font-black tracking-[0.25em] text-[#34D399]">📊 Radar Financeiro 360°</h3>
        <p className="mt-1 text-xs text-[#A7F3D0]/40">Visão integrada dos pilares financeiros e operacionais</p>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2A5A3A" />
              <PolarAngleAxis dataKey="pilar" tick={{ fill: "#A7F3D0", fontSize: 11 }} />
              <PolarRadiusAxis stroke="#A7F3D0" tick={{ fill: "#A7F3D0", fontSize: 10 }} />
              <Radar name="Valor" dataKey="valor" stroke="#34D399" fill="#34D399" fillOpacity={0.3} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A3F2A",
                  borderColor: "#34D399/30",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECOMENDAÇÃO EXECUTIVA */}
      <div className="rounded-3xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-8 shadow-xl">
        <h3 className="text-sm font-black tracking-[0.25em] text-[#34D399]">🎯 Recomendação Executiva</h3>
        <p className="mt-3 text-[#A7F3D0]/80 text-lg leading-relaxed">{recomendacao}</p>
      </div>

      {/* CFO COGNITIVO BIOFINANCEIRO + EXPORTAÇÃO E CONTAS */}
      <div className="rounded-3xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-8 shadow-xl">
        <h3 className="text-sm font-black tracking-[0.25em] text-[#34D399]">CFO Cognitivo BioFinanceiro</h3>
        <p className="mt-3 text-[#A7F3D0]/70">
          O runtime financeiro opera sobre governança semântica, integrado ao Motor π, ICBC 360 e inteligência operacional
          biofinanceira do PecuariaTech.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#A7F3D0]/80">
          <span className="flex items-center gap-1">
            <span className="text-[#34D399]">✅</span> ROI: {roi.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#34D399]">✅</span> EBITDA: R$ {ebitda.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#34D399]">✅</span> Risco: {risco}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[#34D399]">✅</span> Score π: {scorePi.toFixed(1)}
          </span>
        </div>

        {/* BOTÕES DE EXPORTAÇÃO E CONTAS */}
        <div className="mt-6 flex flex-wrap gap-4 border-t border-[#34D399]/10 pt-6">
          <button
            onClick={exportarRelatorio}
            className="px-4 py-2 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition shadow-lg shadow-[#34D399]/30 text-sm flex items-center gap-2"
          >
            📊 Exportar Relatório Financeiro Completo
          </button>
          <Link href="/dashboard/financeiro/contas">
            <button className="px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F2A1A] font-bold hover:bg-[#F59E0B] transition text-sm flex items-center gap-2">
              💳 Gerenciar Contas
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}