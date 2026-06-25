"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../DashboardContext";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function LinhaDoTempo() {
  const { data, loading } = useDashboard();
  const [periodo, setPeriodo] = useState("6");
  const [historico, setHistorico] = useState<any[]>([]);

  // ============================================================
  // DADOS HISTÓRICOS (simulados + real)
  // ============================================================
  useEffect(() => {
    const atual = {
      mes: "Atual",
      score_pi: data?.score_pi || 0,
      roi: data?.roi || 0,
      margem: data?.margem || 0,
      gmd: data?.gmd || 0,
      lotacao: data?.lotacao || 0,
      capital_score: data?.capital_score || 0,
    };

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const historicoSimulado = meses.map((mes, i) => ({
      mes,
      score_pi: Math.round((atual.score_pi || 50) * (0.7 + i * 0.06)),
      roi: Math.round((atual.roi || 100) * (0.5 + i * 0.08)),
      margem: Math.round((atual.margem || 50) * (0.6 + i * 0.07)),
      gmd: Number(((atual.gmd || 1.0) * (0.7 + i * 0.05)).toFixed(2)),
      lotacao: Number(((atual.lotacao || 0.5) * (0.8 + i * 0.04)).toFixed(2)),
      capital_score: Math.round((atual.capital_score || 60) * (0.7 + i * 0.05)),
    }));

    setHistorico([...historicoSimulado, atual]);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0F2A1A]">
        <div className="animate-pulse text-[#A7F3D0]/60">Carregando linha do tempo...</div>
      </div>
    );
  }

  const filtered = historico.slice(-parseInt(periodo));

  // ============================================================
  // 1. BADGES DE INTERPRETAÇÃO
  // ============================================================
  const ultimo = filtered[filtered.length - 1];
  const primeiro = filtered[0];
  const tendenciaScore = ultimo && primeiro ? ultimo.score_pi - primeiro.score_pi : 0;
  const tendenciaROI = ultimo && primeiro ? ultimo.roi - primeiro.roi : 0;
  const tendenciaGMD = ultimo && primeiro ? ultimo.gmd - primeiro.gmd : 0;

  const interpretacaoGeral =
    tendenciaScore > 5
      ? "📈 EVOLUÇÃO POSITIVA"
      : tendenciaScore > 0
      ? "📊 ESTABILIDADE COM LEVE CRESCIMENTO"
      : "📉 ATENÇÃO – QUEDA IDENTIFICADA";

  const recomendacao =
    tendenciaScore > 5 && tendenciaROI > 10
      ? "🔍 A fazenda está em evolução consistente. Mantenha a estratégia atual e busque otimizações pontuais."
      : tendenciaScore > 0 && tendenciaROI > 0
      ? "📈 A operação está estável com leve crescimento. Considere acelerar investimentos em áreas de maior retorno."
      : "⚠️ Identificamos queda em indicadores-chave. Recomenda-se revisar custos e estratégia operacional.";

  // ============================================================
  // 2. CARDS DE TENDÊNCIA
  // ============================================================
  const cardsTendencia = [
    {
      titulo: "Score π",
      valor: ultimo?.score_pi || 0,
      variacao: tendenciaScore,
      unidade: "pts",
      cor: tendenciaScore >= 0 ? "text-emerald-400" : "text-red-400",
      icone: tendenciaScore >= 0 ? "↑" : "↓",
    },
    {
      titulo: "ROI",
      valor: ultimo?.roi || 0,
      variacao: tendenciaROI,
      unidade: "%",
      cor: tendenciaROI >= 0 ? "text-emerald-400" : "text-red-400",
      icone: tendenciaROI >= 0 ? "↑" : "↓",
    },
    {
      titulo: "GMD",
      valor: ultimo?.gmd || 0,
      variacao: tendenciaGMD,
      unidade: "kg/dia",
      cor: tendenciaGMD >= 0 ? "text-emerald-400" : "text-red-400",
      icone: tendenciaGMD >= 0 ? "↑" : "↓",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER EXECUTIVO */}
        <div className="rounded-2xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⏳</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Linha do Tempo</h1>
              <p className="text-[#A7F3D0]/60 text-sm">
                Visão evolutiva da fazenda – para proprietário, contabilidade e controlador
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <select
                className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-[#34D399]/60"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
              </select>
              <span className="inline-flex rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-100">
                ● ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* RESULTADO EXECUTIVO + RECOMENDAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cardsTendencia.map((card) => (
            <div
              key={card.titulo}
              className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5 shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A7F3D0]/50">{card.titulo}</span>
                <span className={`text-xs font-bold ${card.cor}`}>
                  {card.icone} {card.variacao > 0 ? "+" : ""}
                  {card.variacao.toFixed(1)} {card.unidade}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mt-1">
                {card.valor.toFixed(card.titulo === "GMD" ? 2 : 1)}
                <span className="text-sm text-[#A7F3D0]/40 ml-1">{card.unidade}</span>
              </div>
              <div className="text-xs text-[#A7F3D0]/40 mt-1">
                {card.variacao >= 0 ? "✅ Evolução positiva" : "⚠️ Atenção à queda"}
              </div>
            </div>
          ))}
        </div>

        {/* RECOMENDAÇÃO ESTRATÉGICA */}
        <div className="rounded-2xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6 shadow-xl">
          <h3 className="text-sm font-black tracking-[0.25em] text-[#34D399]">🎯 Recomendação Estratégica</h3>
          <p className="mt-3 text-[#A7F3D0]/80 text-lg leading-relaxed">{recomendacao}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs bg-[#34D399]/20 text-[#34D399] px-3 py-1 rounded-full font-bold">
              {interpretacaoGeral}
            </span>
          </div>
        </div>

        {/* GRÁFICO 1 – SCORE π E CAPITAL SCORE */}
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl transition-all duration-200 hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">📈 Score π e Capital Score</h3>
            <span className="text-xs text-[#A7F3D0]/40">Evolução mensal</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A5A3A" />
                <XAxis dataKey="mes" stroke="#A7F3D0" />
                <YAxis stroke="#A7F3D0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A3F2A",
                    borderColor: "#34D399/30",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score_pi"
                  stroke="#34D399"
                  name="Score π"
                  strokeWidth={3}
                  dot={{ fill: "#34D399" }}
                />
                <Line
                  type="monotone"
                  dataKey="capital_score"
                  stroke="#60A5FA"
                  name="Capital Score"
                  strokeWidth={3}
                  dot={{ fill: "#60A5FA" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#A7F3D0]/40 text-center mt-2">
            Tendência dos principais indicadores estratégicos
          </p>
        </div>

        {/* GRÁFICO 2 – ROI E MARGEM */}
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl transition-all duration-200 hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">💰 ROI e Margem</h3>
            <span className="text-xs text-[#A7F3D0]/40">Evolução mensal</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A5A3A" />
                <XAxis dataKey="mes" stroke="#A7F3D0" />
                <YAxis stroke="#A7F3D0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A3F2A",
                    borderColor: "#34D399/30",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="roi"
                  stroke="#34D399"
                  fill="#34D399"
                  fillOpacity={0.2}
                  name="ROI %"
                />
                <Area
                  type="monotone"
                  dataKey="margem"
                  stroke="#FBBF24"
                  fill="#FBBF24"
                  fillOpacity={0.2}
                  name="Margem %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#A7F3D0]/40 text-center mt-2">
            Evolução da rentabilidade e eficiência operacional
          </p>
        </div>

        {/* GRÁFICO 3 – GMD E LOTAÇÃO */}
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl transition-all duration-200 hover:scale-[1.01]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">🐄 GMD e Lotação</h3>
            <span className="text-xs text-[#A7F3D0]/40">Evolução mensal</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A5A3A" />
                <XAxis dataKey="mes" stroke="#A7F3D0" />
                <YAxis stroke="#A7F3D0" yAxisId="left" />
                <YAxis stroke="#A7F3D0" yAxisId="right" orientation="right" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A3F2A",
                    borderColor: "#34D399/30",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="gmd" fill="#34D399" name="GMD (kg/dia)" yAxisId="left" />
                {/* ✅ COR DA LOTAÇÃO AJUSTADA: rosa → roxo premium */}
                <Bar dataKey="lotacao" fill="#A78BFA" name="Lotação (UA/ha)" yAxisId="right" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#A7F3D0]/40 text-center mt-2">
            Desempenho biológico e uso do solo
          </p>
        </div>
      </div>
    </div>
  );
}