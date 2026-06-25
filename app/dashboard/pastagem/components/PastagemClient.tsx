"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "../../DashboardContext";
import PastagemPiquetesTable from "./PastagemPiquetesTable";
import PastagemResumoCard from "./PastagemResumoCard";
import PastagemAIInsights from "./PastagemAIInsights";
import PastagemAlertasCard from "./PastagemAlertasCard";
import PastagemTriangulo360 from "./PastagemTriangulo360";

export default function PastagemClient() {
  const router = useRouter();
  const { data, loading } = useDashboard();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0F2A1A]">
        <div className="animate-pulse text-[#A7F3D0]/60">Carregando dados da pastagem...</div>
      </div>
    );
  }

  const areaTotal = (data as any)?.area_total_ha ?? 0;
  const lotacao = data?.lotacao ?? 0;
  const scorePi = data?.score_pi ?? 0;
  const capitalScore = data?.capital_score ?? 0;
  const risco = data?.risco_estrutural?.toUpperCase() ?? "N/D";

  const refresh = () => setRefreshKey((prev) => prev + 1);

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
                ULTRA BIOLOGICAL COGNITIVE RUNTIME
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mt-4 tracking-tight">
                Central PecuariaTech – Pastagem
              </h1>
              <p className="text-[#A7F3D0]/70 mt-2 max-w-3xl">
                Gestão nutricional e estratégica de pastagens com inteligência cognitiva
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/pastagem/novo"
                className="px-4 py-2 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition shadow-lg shadow-[#34D399]/30 flex items-center gap-2"
              >
                ➕ Novo Piquete
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
            <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Área Total</div>
            <div className="text-3xl font-bold text-white mt-1">{areaTotal.toFixed(1)} ha</div>
            <div className="text-xs text-[#A7F3D0]/40 mt-1">
              {areaTotal > 100 ? "ÁREA EXTENSA" : "ÁREA MODERADA"}
            </div>
          </div>
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
            <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Lotação</div>
            <div className="text-3xl font-bold text-white mt-1">{lotacao.toFixed(2)} UA/ha</div>
            <div className="text-xs text-[#A7F3D0]/40 mt-1">
              {lotacao < 0.5 ? "POTENCIAL DE EXPANSÃO" : lotacao < 1 ? "LOTAÇÃO ADEQUADA" : "ATENÇÃO À LOTAÇÃO"}
            </div>
          </div>
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
            <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Score π</div>
            <div className="text-3xl font-bold text-white mt-1">{scorePi.toFixed(1)}</div>
            <div className="text-xs text-[#A7F3D0]/40 mt-1">
              {scorePi > 80 ? "EXCELENTE" : scorePi > 60 ? "BOM" : "ATENÇÃO"}
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

        {/* RESUMO DA PASTAGEM */}
        <PastagemResumoCard />

        {/* TABELA DE PIQUETES COM AÇÕES */}
        <PastagemPiquetesTable key={refreshKey} onRefresh={refresh} />

        {/* INSIGHTS E ALERTAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PastagemAIInsights />
          <PastagemAlertasCard />
        </div>

        {/* TRIÂNGULO 360 */}
        <PastagemTriangulo360 />
      </div>
    </div>
  );
}