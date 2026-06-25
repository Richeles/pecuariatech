"use client";

import { DashboardProvider, useDashboard } from "./DashboardContext";
import {
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Gauge,
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import ExportPDF from "./components/ExportPDF";

export default function DashboardClient() {
  const userId = "96a1a441-c0f6-43b2-9cb7-4fadc17fd261";

  return (
    <DashboardProvider userId={userId}>
      <DashboardContent />
    </DashboardProvider>
  );
}

function DashboardContent() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F2A1A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#34D399] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#A7F3D0]/60 text-sm font-medium">Carregando dados cognitivos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F2A1A] p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-2xl text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Erro ao carregar dados</h2>
          <p className="text-red-300/70 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F2A1A] p-6">
        <div className="bg-[#1A3F2A]/60 border border-[#34D399]/20 rounded-2xl p-8 max-w-2xl text-center">
          <p className="text-[#A7F3D0]/60">Nenhum dado disponível no momento.</p>
        </div>
      </div>
    );
  }

  const radarData = [
    { pilar: "Governança", valor: data.governanca || 0 },
    { pilar: "ESG", valor: data.esg || 0 },
    { pilar: "Rastreabilidade", valor: data.rastreabilidade || 0 },
    { pilar: "Maturidade Digital", valor: data.maturidade_digital || 0 },
    { pilar: "Compliance", valor: data.compliance || 0 },
    { pilar: "Capital Intelectual", valor: data.capital_intelectual || 0 },
  ];

  const historicoScore = [
    { mes: "Jan", valor: 30 },
    { mes: "Fev", valor: 35 },
    { mes: "Mar", valor: data.score_pi ? data.score_pi - 10 : 38 },
    { mes: "Abr", valor: data.score_pi ? data.score_pi - 5 : 42 },
    { mes: "Mai", valor: data.score_pi ? data.score_pi - 2 : 45 },
    { mes: "Jun", valor: data.score_pi ?? 48 },
  ];

  const temDadosICBC = radarData.some((item) => item.valor > 0);

  const alertas = [];
  if (data.governanca < 40) alertas.push("⚠️ Governança abaixo de 40 – reforçar estrutura de gestão.");
  if (data.lotacao < 0.5) alertas.push("⚠️ Lotação abaixo do potencial – aumentar ocupação.");
  if (data.margem < 30) alertas.push("⚠️ Margem caiu – revisar estrutura de custos.");
  if (data.score_pi < 50) alertas.push("⚠️ Score π abaixo de 50 – atenção à performance geral.");
  if (data.capital_score < 60) alertas.push("⚠️ Capital Score baixo – fortalecer pilares do ICBC.");
  if (alertas.length === 0) alertas.push("✅ Todas as métricas dentro do esperado. Operação estável.");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="relative overflow-hidden rounded-3xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6 md:p-10 shadow-2xl shadow-[#34D399]/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#34D399]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981]/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#34D399]" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-[#34D399]/80">Runtime Executivo Ativo</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mt-2 tracking-tight">PecuariaTech Intelligence Center</h1>
              <p className="text-[#A7F3D0]/70 mt-1 text-lg">Visão Executiva 360° da Fazenda</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 bg-[#0F2A1A]/60 backdrop-blur-sm rounded-2xl border border-[#34D399]/10 px-6 py-4">
                <div className="text-center">
                  <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-widest">Score π</div>
                  <div className="text-3xl font-black text-white">{data.score_pi?.toFixed(1) ?? 0}</div>
                </div>
                <div className="w-px h-10 bg-[#34D399]/20" />
                <div className="text-center">
                  <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-widest">Capital Score</div>
                  <div className="text-3xl font-black text-[#34D399]">{data.capital_score?.toFixed(1) ?? 0}</div>
                </div>
                <div className="w-px h-10 bg-[#34D399]/20" />
                <div className="text-center">
                  <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-widest">ROI</div>
                  <div className="text-3xl font-black text-white">{data.roi?.toFixed(1) ?? 0}%</div>
                </div>
                <div className="w-px h-10 bg-[#34D399]/20" />
                <div className="text-center">
                  <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-widest">GMD</div>
                  <div className="text-3xl font-black text-white">{data.gmd?.toFixed(3) ?? 0} kg/dia</div>
                </div>
              </div>
              <ExportPDF dados={data} titulo="Dashboard Executivo" />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-[#34D399]/10 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#34D399]" />
                ICBC 360 – Radar Executivo
              </h3>
              {!temDadosICBC && <span className="text-xs text-[#A7F3D0]/40">Aguardando dados...</span>}
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2A5A3A" />
                  <PolarAngleAxis dataKey="pilar" tick={{ fill: "#A7F3D0", fontSize: 11 }} />
                  <Radar name="Capital Score" dataKey="valor" stroke="#34D399" fill="#34D399" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: "#1A3F2A", borderColor: "#34D399/30", borderRadius: "12px", color: "#fff" }} formatter={(value: number) => value.toFixed(1)} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[#A7F3D0]/40 text-center mt-2">Pilares do Capital Intelectual (0–100)</p>
          </div>

          <div className="rounded-3xl border border-[#34D399]/10 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#34D399]" />
                Evolução do Score π
              </h3>
              <span className="text-xs text-[#A7F3D0]/40">Últimos 6 meses</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicoScore}>
                  <Line type="monotone" dataKey="valor" stroke="#34D399" strokeWidth={3} dot={{ fill: "#34D399", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1A3F2A", borderColor: "#34D399/30", borderRadius: "12px", color: "#fff" }} formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[#A7F3D0]/40 text-center mt-2">Tendência baseada nos dados do DTO</p>
          </div>
        </section>

        <section className="flex flex-wrap gap-3 justify-center md:justify-start">
          <Link href="/dashboard/financeiro" className="inline-flex items-center gap-2 px-5 py-3 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] rounded-xl hover:bg-[#34D399]/20 transition text-sm font-medium">
            <DollarSign className="w-4 h-4" /> Financeiro
          </Link>
          <Link href="/dashboard/rebanho" className="inline-flex items-center gap-2 px-5 py-3 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] rounded-xl hover:bg-[#34D399]/20 transition text-sm font-medium">
            <Activity className="w-4 h-4" /> Rebanho
          </Link>
          <Link href="/dashboard/pastagem" className="inline-flex items-center gap-2 px-5 py-3 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] rounded-xl hover:bg-[#34D399]/20 transition text-sm font-medium">
            <Gauge className="w-4 h-4" /> Pastagem
          </Link>
          <Link href="/dashboard/engorda" className="inline-flex items-center gap-2 px-5 py-3 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] rounded-xl hover:bg-[#34D399]/20 transition text-sm font-medium">
            <TrendingUp className="w-4 h-4" /> Engorda
          </Link>
          <Link href="/dashboard/cfo" className="inline-flex items-center gap-2 px-5 py-3 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] rounded-xl hover:bg-[#34D399]/20 transition text-sm font-medium">
            <BarChart3 className="w-4 h-4" /> CFO
          </Link>
        </section>

        <section className="rounded-3xl border border-[#34D399]/10 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#34D399]" />
            Alertas Cognitivos
          </h3>
          <div className="space-y-2">
            {alertas.map((alerta, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-[#0F2A1A]/40 border border-[#34D399]/10">
                <span className="text-[#34D399]">•</span>
                <span className="text-[#A7F3D0]/80 text-sm">{alerta}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#34D399]/10">
          <div className="flex items-center gap-6 text-xs text-[#A7F3D0]/50">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-[#34D399]" /> Dados em tempo real</span>
            <span className="flex items-center gap-1"><Activity className="w-4 h-4 text-[#34D399]" /> Motor π ativo</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-[#34D399]" /> ICBC 360 online</span>
          </div>
          <div className="text-xs text-[#A7F3D0]/30">Última atualização: {data.timestamp ? new Date(data.timestamp).toLocaleString() : "agora"}</div>
        </footer>
      </div>
    </div>
  );
}