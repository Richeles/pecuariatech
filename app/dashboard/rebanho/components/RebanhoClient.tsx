"use client";

import { useEffect, useMemo, useState } from "react";

import RebanhoSanidadePainel
from "./RebanhoSanidadePainel";

import CentroCognitivoRebanho
from "./cognitivo/CentroCognitivoRebanho";

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

  const [rows, setRows] =
    useState<ApiRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [q, setQ] =
    useState("");

  const [erro, setErro] =
    useState<string | null>(null);

  const [runtimeAI, setRuntimeAI] =
    useState<RuntimeAI | null>(null);

  // =====================================================
  // FETCH
  // =====================================================

  useEffect(() => {

    let ativo = true;

    async function load() {

      try {

        // =========================================
        // REBANHO
        // =========================================

        const res =
          await fetch(
            "/api/rebanho",
            {
              cache: "no-store",
              credentials: "include",
            }
          );

        if (!res.ok) {

          if (ativo) {

            setErro(
              "Erro ao carregar dados do rebanho"
            );
          }

          return;
        }

        const json =
          await res.json().catch(() => null);

        if (!ativo) return;

        if (
          json?.ok &&
          Array.isArray(json?.rows)
        ) {

          setRows(json.rows);

        } else {

          setRows([]);
        }

        // =========================================
        // IA RUNTIME
        // =========================================

        try {

          const ai =
            await fetch(
              "/api/ai/rebanho",
              {
                cache: "no-store",
              }
            );

          const aiJson =
            await ai.json();

          if (ativo) {

            setRuntimeAI(aiJson);
          }

        } catch {

          if (ativo) {

            setRuntimeAI(null);
          }
        }

      } catch (e) {

        console.error(
          "Erro fetch rebanho:",
          e
        );

        if (ativo) {

          setErro(
            "Falha de conexão com o servidor"
          );
        }

      } finally {

        if (ativo) {

          setLoading(false);
        }
      }
    }

    load();

    return () => {

      ativo = false;
    };

  }, []);

  // =====================================================
  // CONSOLIDAÇÃO
  // =====================================================

  const animals =
    useMemo<AnimalUI[]>(() => {

      if (!rows?.length) {
        return [];
      }

      const map =
        new Map<string, AnimalUI>();

      for (const r of rows) {

        if (!r?.animal_id) {
          continue;
        }

        if (!map.has(r.animal_id)) {

          map.set(r.animal_id, {

            animal_id:
              r.animal_id,

            brinco:
              r.animal_brinco ?? "—",

            raca:
              r.raca ?? "—",

            sexo:
              r.sexo ?? "—",

            peso:
              r.peso ?? null,

            status_biologico:
              r.status_biologico ?? "—",

            ultima_localizacao:
              r.movimentacao_local ?? "—",
          });
        }
      }

      return Array
        .from(map.values())
        .sort((a, b) =>
          a.brinco.localeCompare(
            b.brinco
          )
        );

    }, [rows]);

  // =====================================================
  // FILTER
  // =====================================================

  const filtered =
    useMemo(() => {

      if (!q.trim()) {
        return animals;
      }

      const term =
        q.toLowerCase();

      return animals.filter((a) =>

        [
          a.brinco,
          a.raca,
          a.sexo,
          a.status_biologico,
          a.ultima_localizacao,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)

      );

    }, [animals, q]);

  // =====================================================
  // MÉTRICAS
  // =====================================================

  const resumo =
    useMemo(() => {

      if (!filtered.length) {

        return {

          total: 0,

          semLocalizacao: 0,

          semPeso: 0,

          machos: 0,

          femeas: 0,

          racasTop: [],
        };
      }

      let semLocalizacao = 0;

      let semPeso = 0;

      let machos = 0;

      let femeas = 0;

      const racas =
        new Map<string, number>();

      for (const a of filtered) {

        if (
          !a.ultima_localizacao ||
          a.ultima_localizacao === "—"
        ) {

          semLocalizacao++;
        }

        if (a.peso == null) {

          semPeso++;
        }

        const sx =
          a.sexo.toLowerCase();

        if (
          sx.includes("macho")
        ) {

          machos++;
        }

        if (
          sx.includes("fêmea") ||
          sx.includes("femea")
        ) {

          femeas++;
        }

        const r =
          a.raca.trim();

        racas.set(
          r,
          (racas.get(r) ?? 0) + 1
        );
      }

      const racasTop =
        Array.from(racas.entries())
          .filter(([nome]) =>
            nome &&
            nome !== "—"
          )
          .sort((a, b) =>
            b[1] - a[1]
          )
          .slice(0, 3)
          .map(([nome, qtd]) => ({
            nome,
            qtd,
          }));

      return {

        total: filtered.length,

        semLocalizacao,

        semPeso,

        machos,

        femeas,

        racasTop,
      };

    }, [filtered]);

  // =====================================================
  // STATES
  // =====================================================

  if (loading) {

    return (

      <div className="p-10 text-slate-500">

        Inicializando Runtime Cognitivo...

      </div>
    );
  }

  if (erro) {

    return (

      <div className="p-10 text-red-500">

        {erro}

      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <section className="space-y-6">

      {/* =====================================================
          RUNTIME COGNITIVO
      ===================================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-emerald-400/30
          bg-gradient-to-br
          from-[#03140d]
          via-[#072117]
          to-[#0b2d1f]
          p-8
          shadow-[0_20px_90px_rgba(0,0,0,0.35)]
        "
      >

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]
          "
        />

        <div
          className="
            relative
            z-10
            flex
            items-center
            justify-between
            gap-6
          "
        >

          <div>

            <div
              className="
                text-4xl
                font-black
                tracking-tight
                text-white
              "
            >
              Runtime Cognitivo Rebanho
            </div>

            <div
              className="
                mt-3
                text-base
                font-semibold
                text-emerald-200
              "
            >
              Governança Biológica • IA Operacional • Runtime Multi-Engine
            </div>

          </div>

          <div
            className="
              rounded-full
              border
              border-emerald-400/20
              bg-emerald-500/20
              px-6
              py-3
              text-xs
              font-black
              tracking-[0.25em]
              text-emerald-100
            "
          >
            ONLINE
          </div>

        </div>

      </div>

      {/* =====================================================
          CENTRO COGNITIVO
      ===================================================== */}

      <CentroCognitivoRebanho

        diagnostico={
          runtimeAI?.diagnostico
        }

        advisory={
          runtimeAI?.advisory || []
        }

        decisao={
          runtimeAI?.decisao_recomendada
        }

      />

      {/* =====================================================
          SANIDADE
      ===================================================== */}

      <RebanhoSanidadePainel
        total={resumo.total}
        semLocalizacao={resumo.semLocalizacao}
        semPeso={resumo.semPeso}
        machos={resumo.machos}
        femeas={resumo.femeas}
        racasTop={resumo.racasTop}
      />

    </section>
  );
}