"use client";

import { useDashboard } from "../../DashboardContext";
import CentroCognitivoEngorda from "./cognitivo/CentroCognitivoEngorda";
import EngordaExecutivePanel from "./cognitivo/EngordaExecutivePanel";
import EngordaLotesTable from "./EngordaLotesTable";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function EngordaClient() {
  const { data, loading } = useDashboard();
  const [lotes, setLotes] = useState([]);
  const [loadingLotes, setLoadingLotes] = useState(true);

  useEffect(() => {
    async function carregarLotes() {
      try {
        const res = await fetch("/api/engorda", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setLotes(json?.rows || json?.data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar lotes:", error);
      }
      setLoadingLotes(false);
    }
    carregarLotes();
  }, []);

  if (loading || loadingLotes) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0F2A1A]">
        <div className="animate-pulse text-[#A7F3D0]/60">Carregando dados da engorda...</div>
      </div>
    );
  }

  const gmd = data?.gmd ?? 0;
  const scorePi = data?.score_pi ?? 0;
  const capitalScore = data?.capital_score ?? 0;
  const risco = data?.risco_estrutural?.toUpperCase() ?? "N/D";

  const interpretacaoGMD = gmd > 1.2 ? "DESEMPENHO SUPERIOR" : gmd > 0.8 ? "DESEMPENHO MODERADO" : "ATENÇÃO";
  const corGMD = gmd > 1.2 ? "text-emerald-400" : gmd > 0.8 ? "text-yellow-400" : "text-red-400";
  const impactoGMD = gmd > 1.2 ? "Ganho acima da média regional" : gmd > 0.8 ? "Dentro do esperado" : "Abaixo do esperado";
  const acaoGMD = gmd > 1.2 ? "Manter protocolo nutricional" : gmd > 0.8 ? "Revisar dieta" : "Ajustar manejo alimentar";

  const lucroProjetado = (gmd * 12 * 180).toFixed(0);
  const recomendacaoVenda = gmd > 1.2 ? "Antecipar venda em 7 dias" : "Manter ciclo atual";

  const benchmarkRegional = 0.95;
  const benchmarkTop10 = 1.28;
  const vsRegional = ((gmd - benchmarkRegional) / benchmarkRegional * 100).toFixed(0);
  const vsTop10 = ((gmd - benchmarkTop10) / benchmarkTop10 * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER EXECUTIVO */}
        <div className="relative overflow-hidden rounded-3xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6 md:p-10 shadow-2xl shadow-[#34D399]/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#34D399]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981]/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-black tracking-[0.25em] text-emerald-200">
                🧬 ULTRA BIOLOGICAL COGNITIVE RUNTIME
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mt-4 tracking-tight">
                Central PecuariaTech – Engorda
              </h1>
              <p className="text-[#A7F3D0]/70 mt-2 max-w-3xl">
                Performance e conversão animal com inteligência cognitiva
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/engorda/novo"
                className="px-4 py-2 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition shadow-lg shadow-[#34D399]/30 flex items-center gap-2"
              >
                ➕ Novo Lote
              </Link>
              <span className="inline-flex rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-100">
                ● ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* KPIs EXECUTIVOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
            <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">GMD</div>
            <div className={`text-3xl font-bold ${corGMD} mt-1`}>{gmd.toFixed(3)} kg/dia</div>
            <div className="text-xs text-[#34D399] mt-1 font-bold">{interpretacaoGMD}</div>
            <div className="text-xs text-[#A7F3D0]/40 mt-1">{impactoGMD}</div>
          </div>
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
            <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Score π</div>
            <div className="text-3xl font-bold text-white mt-1">{scorePi.toFixed(1)}</div>
            <div className="text-xs text-[#A7F3D0]/40 mt-1">
              {scorePi > 80 ? "EXCELENTE" : scorePi > 60 ? "BOM" : "ATENÇÃO"}
            </div>
          </div>
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
            <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Capital Score</div>
            <div className="text-3xl font-bold text-[#34D399] mt-1">{capitalScore.toFixed(1)}</div>
            <div className="text-xs text-[#A7F3D0]/40 mt-1">
              {capitalScore > 80 ? "MATURIDADE ELEVADA" : capitalScore > 60 ? "MATURIDADE INTERMEDIÁRIA" : "ATENÇÃO"}
            </div>
          </div>
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
            <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Risco</div>
            <div className={`text-3xl font-bold mt-1 ${risco === "BAIXO" ? "text-green-400" : risco === "MODERADO" ? "text-yellow-400" : "text-red-400"}`}>
              {risco}
            </div>
            <div className="text-xs text-[#A7F3D0]/40 mt-1">
              {risco === "BAIXO" ? "RISCO CONTROLADO" : "ATENÇÃO"}
            </div>
          </div>
        </div>

        {/* Xπ – INTERPRETAÇÃO EXECUTIVA */}
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🧠</span>
            <h2 className="text-xl font-bold text-white">Xπ – Interpretação Executiva</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F2A1A]/50 rounded-xl p-4 border border-[#34D399]/10">
              <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Interpretação</div>
              <div className={`text-2xl font-bold ${corGMD} mt-1`}>{interpretacaoGMD}</div>
              <div className="text-sm text-[#A7F3D0]/70 mt-2">{impactoGMD}</div>
              <div className="text-sm text-[#A7F3D0]/60 mt-2">✅ {acaoGMD}</div>
            </div>
            <div className="bg-[#0F2A1A]/50 rounded-xl p-4 border border-[#34D399]/10">
              <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Benchmark</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <div className="text-xs text-[#A7F3D0]/40">Sua Fazenda</div>
                  <div className="text-lg font-bold text-white">{gmd.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#A7F3D0]/40">Média Regional</div>
                  <div className="text-lg font-bold text-yellow-400">{benchmarkRegional.toFixed(2)}</div>
                  <div className="text-xs text-[#A7F3D0]/40">{vsRegional}%</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-[#A7F3D0]/40">Top 10%</div>
                  <div className="text-lg font-bold text-emerald-400">{benchmarkTop10.toFixed(2)}</div>
                  <div className="text-xs text-[#A7F3D0]/40">{vsTop10}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Xπ+ – DECISÃO EXECUTIVA */}
        <div className="rounded-2xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-bold text-white">Xπ+ – Decisão Executiva</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F2A1A]/50 rounded-xl p-4 border border-[#34D399]/10">
              <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Lucro Projetado</div>
              <div className="text-3xl font-bold text-[#34D399]">R$ {lucroProjetado}</div>
              <div className="text-sm text-[#A7F3D0]/60 mt-2">Por lote</div>
            </div>
            <div className="bg-[#0F2A1A]/50 rounded-xl p-4 border border-[#34D399]/10">
              <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Recomendação</div>
              <div className="text-xl font-bold text-white">{recomendacaoVenda}</div>
              <div className="text-sm text-[#A7F3D0]/60 mt-2">
                {recomendacaoVenda.includes("Antecipar") 
                  ? "Ganho estimado: +R$ 6.300" 
                  : "Aguardar próximo ciclo"}
              </div>
            </div>
          </div>
        </div>

        {/* COMPONENTES OPERACIONAIS */}
        <CentroCognitivoEngorda />
        <EngordaExecutivePanel />

        {/* 🌾 TABELA DE LOTES COM NUTRIÇÃO */}
        <EngordaLotesTable lotes={lotes} />
      </div>
    </div>
  );
}