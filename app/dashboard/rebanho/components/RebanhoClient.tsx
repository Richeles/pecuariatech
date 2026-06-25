"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../DashboardContext";

import RebanhoSanidadePainel from "./RebanhoSanidadePainel";
import CentroCognitivoRebanho from "./cognitivo/CentroCognitivoRebanho";
import CadastroAnimal from "./CadastroAnimal";

/* =========================================================
   TYPES
========================================================= */

type RuntimeAI = {
  runtime_online?: boolean;
  runtime_status?: string;
  executivo?: string;
  operacional?: string;
  tatico?: string;
  decisao_recomendada?: string;
  advisory?: string[];
  diagnostico?: {
    score_biologico?: number;
    risco?: string;
    compliance?: number;
    pressao?: number;
    temperatura?: number;
    sanidade?: number;
    peso?: number;
    ganho?: number;
  };
};

type ApiRow = {
  animal_id: string;
  animal_brinco: string | null;
  raca: string | null;
  sexo: string | null;
  peso: number | null;
  status: string | null;
  status_biologico: string | null;
  movimentacao_tipo: string | null;
  movimentacao_local: string | null;
  movimentacao_data_entrada: string | null;
  movimentacao_data_saida: string | null;
};

type AnimalUI = {
  animal_id: string;
  brinco: string;
  raca: string;
  sexo: string;
  peso: number | null;
  status_biologico: string;
  ultima_localizacao: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function RebanhoClient() {
  const { data, loading: dtoLoading } = useDashboard();

  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [runtimeAI, setRuntimeAI] = useState<RuntimeAI | null>(null);

  useEffect(() => {
    let ativo = true;

    async function load() {
      try {
        const res = await fetch("/api/rebanho", {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          if (ativo) setErro("Erro ao carregar dados do rebanho");
          return;
        }

        const json = await res.json().catch(() => null);
        if (!ativo) return;

        if (json?.ok && Array.isArray(json?.rows)) {
          setRows(json.rows);
        } else {
          setRows([]);
        }

        try {
          const ai = await fetch("/api/ai/rebanho", { cache: "no-store" });
          const aiJson = await ai.json();
          if (ativo) setRuntimeAI(aiJson);
        } catch {
          if (ativo) setRuntimeAI(null);
        }
      } catch (e) {
        console.error("Erro fetch rebanho:", e);
        if (ativo) setErro("Falha de conexão com o servidor");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    load();
    return () => { ativo = false; };
  }, []);

  const animals = useMemo<AnimalUI[]>(() => {
    if (!rows?.length) return [];

    const map = new Map<string, AnimalUI>();

    for (const r of rows) {
      if (!r?.animal_id) continue;
      if (!map.has(r.animal_id)) {
        map.set(r.animal_id, {
          animal_id: r.animal_id,
          brinco: r.animal_brinco ?? "—",
          raca: r.raca ?? "—",
          sexo: r.sexo ?? "—",
          peso: r.peso ?? null,
          status_biologico: r.status_biologico ?? "—",
          ultima_localizacao: r.movimentacao_local ?? "—",
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.brinco.localeCompare(b.brinco)
    );
  }, [rows]);

  const filtered = useMemo(() => {
    if (!q.trim()) return animals;
    const term = q.toLowerCase();
    return animals.filter((a) =>
      [a.brinco, a.raca, a.sexo, a.status_biologico, a.ultima_localizacao]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [animals, q]);

  const resumo = useMemo(() => {
    if (!filtered.length) {
      return { total: 0, semLocalizacao: 0, semPeso: 0, machos: 0, femeas: 0, racasTop: [] };
    }

    let semLocalizacao = 0;
    let semPeso = 0;
    let machos = 0;
    let femeas = 0;
    const racas = new Map<string, number>();

    for (const a of filtered) {
      if (!a.ultima_localizacao || a.ultima_localizacao === "—") semLocalizacao++;
      if (a.peso == null) semPeso++;

      const sx = a.sexo.toLowerCase();
      if (sx.includes("macho")) machos++;
      if (sx.includes("fêmea") || sx.includes("femea")) femeas++;

      const r = a.raca.trim();
      racas.set(r, (racas.get(r) ?? 0) + 1);
    }

    const racasTop = Array.from(racas.entries())
      .filter(([nome]) => nome && nome !== "—")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nome, qtd]) => ({ nome, qtd }));

    return { total: filtered.length, semLocalizacao, semPeso, machos, femeas, racasTop };
  }, [filtered]);

  const scoreBiologico = data?.score_pi ?? runtimeAI?.diagnostico?.score_biologico ?? 0;
  const risco = data?.risco_estrutural?.toUpperCase() ?? runtimeAI?.diagnostico?.risco ?? "BAIXO";
  const compliance = data?.capital_score ?? runtimeAI?.diagnostico?.compliance ?? 0;
  const gmd = data?.gmd ?? 0;
  const quantidade = (data as any)?.quantidade ?? resumo.total;

  if (loading || dtoLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0F2A1A]">
        <div className="animate-pulse text-[#A7F3D0]/60">Carregando dados do rebanho...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0F2A1A] p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <p className="text-red-400">{erro}</p>
        </div>
      </div>
    );
  }

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
                Governança Cognitiva do Rebanho
              </h1>
              <p className="text-[#A7F3D0]/70 mt-2 max-w-3xl">
                Plataforma executiva integrada ao motor cognitivo PecuariaTech com rastreabilidade inteligente,
                brincos IoT, sanidade operacional, pressão animal, compliance biológico e governança estrutural contínua.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-[420px]">
              <div className="rounded-2xl border border-[#34D399]/20 bg-[#0F2A1A]/60 p-4 text-center">
                <div className="text-xs text-[#A7F3D0]/50">SCORE BIOLÓGICO</div>
                <div className="text-3xl font-bold text-white">{scoreBiologico}</div>
              </div>
              <div className="rounded-2xl border border-[#34D399]/20 bg-[#0F2A1A]/60 p-4 text-center">
                <div className="text-xs text-[#A7F3D0]/50">RISCO OPERACIONAL</div>
                <div className="text-2xl font-bold text-emerald-300">{risco}</div>
              </div>
              <div className="rounded-2xl border border-[#34D399]/20 bg-[#0F2A1A]/60 p-4 text-center">
                <div className="text-xs text-[#A7F3D0]/50">COMPLIANCE</div>
                <div className="text-3xl font-bold text-white">{compliance}%</div>
              </div>
              <div className="rounded-2xl border border-[#34D399]/20 bg-[#0F2A1A]/60 p-4 text-center">
                <div className="text-xs text-[#A7F3D0]/50">STATUS</div>
                <div className="inline-flex rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-black text-emerald-100">
                  ONLINE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTRO COGNITIVO */}
        <CentroCognitivoRebanho
          diagnostico={runtimeAI?.diagnostico}
          advisory={runtimeAI?.advisory || []}
          decisao={runtimeAI?.decisao_recomendada}
        />

        {/* CADASTRO ANIMAL */}
        <CadastroAnimal />

        {/* SANIDADE */}
        <RebanhoSanidadePainel
          total={resumo.total}
          semLocalizacao={resumo.semLocalizacao}
          semPeso={resumo.semPeso}
          machos={resumo.machos}
          femeas={resumo.femeas}
          racasTop={resumo.racasTop}
        />

        {/* VISÃO EXECUTIVA */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#34D399]/10 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
            <div className="text-xs font-black tracking-[0.25em] text-[#A7F3D0]/50">GOVERNANÇA EXECUTIVA</div>
            <div className="mt-3 text-[#A7F3D0]/80">
              {runtimeAI?.executivo || "Governança biológica sincronizada."}
            </div>
          </div>
          <div className="rounded-2xl border border-[#34D399]/10 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
            <div className="text-xs font-black tracking-[0.25em] text-[#A7F3D0]/50">MOTOR OPERACIONAL</div>
            <div className="mt-3 text-[#A7F3D0]/80">
              {runtimeAI?.operacional || "Operação estabilizada via IA cognitiva."}
            </div>
          </div>
          <div className="rounded-2xl border border-[#34D399]/10 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
            <div className="text-xs font-black tracking-[0.25em] text-[#A7F3D0]/50">MOTOR TÁTICO</div>
            <div className="mt-3 text-[#A7F3D0]/80">
              {runtimeAI?.tatico || "Sincronismo operacional contínuo."}
            </div>
          </div>
        </div>

        {/* TABELA EXECUTIVA */}
        <div className="rounded-3xl border border-[#34D399]/10 bg-[#1A3F2A]/60 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between border-b border-[#34D399]/10">
            <div>
              <div className="text-xl font-bold text-white">Rebanho Inteligente</div>
              <div className="text-sm text-[#A7F3D0]/40">Rastreabilidade biológica • Brincos inteligentes • Governança operacional</div>
            </div>
            <div className="w-full md:w-80">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar animal, raça, status..."
                className="w-full rounded-xl border border-[#34D399]/20 bg-[#0F2A1A]/70 px-4 py-2.5 text-sm text-white placeholder-[#A7F3D0]/40 focus:outline-none focus:ring-2 focus:ring-[#34D399]/60"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0F2A1A]/50">
                <tr>
                  <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Brinco</th>
                  <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Raça</th>
                  <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Sexo</th>
                  <th className="p-4 text-right text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Peso</th>
                  <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Status</th>
                  <th className="p-4 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Localização</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.animal_id} className="border-t border-[#34D399]/5 hover:bg-[#34D399]/5 transition-colors">
                    <td className="p-4 font-bold text-white">{a.brinco}</td>
                    <td className="p-4 text-[#A7F3D0]/80">{a.raca}</td>
                    <td className="p-4 text-[#A7F3D0]/80">{a.sexo}</td>
                    <td className="p-4 text-right font-semibold text-white">{a.peso ?? "—"} kg</td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1 text-xs font-black tracking-wider text-[#34D399]">
                        {a.status_biologico}
                      </span>
                    </td>
                    <td className="p-4 text-[#A7F3D0]/60">{a.ultima_localizacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}