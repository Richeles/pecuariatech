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
  // SCORE EXECUTIVO
  // =====================================================

  const scoreBiologico =
    runtimeAI?.diagnostico?.score_biologico ?? 0;

  const risco =
    runtimeAI?.diagnostico?.risco ?? "BAIXO";

  const compliance =
    runtimeAI?.diagnostico?.compliance ?? 0;

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

    <section className="space-y-8">

      {/* =====================================================
          HEADER EXECUTIVO
      ===================================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[40px]
          border
          border-emerald-500/20
          bg-gradient-to-br
          from-[#03140d]
          via-[#072117]
          to-[#0b2d1f]
          p-10
          shadow-[0_30px_120px_rgba(0,0,0,0.45)]
        "
      >

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%)]
          "
        />

        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-10
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div className="max-w-4xl">

            <div
              className="
                inline-flex
                rounded-full
                border
                border-emerald-400/20
                bg-emerald-500/10
                px-5
                py-2
                text-xs
                font-black
                tracking-[0.25em]
                text-emerald-200
              "
            >
              ULTRA BIOLOGICAL COGNITIVE RUNTIME
            </div>

            <h1
              className="
                mt-6
                text-5xl
                font-black
                tracking-tight
                text-white
              "
            >
              Governança Cognitiva do Rebanho
            </h1>

            <p
              className="
                mt-5
                max-w-3xl
                text-lg
                leading-relaxed
                text-emerald-100/80
              "
            >
              Plataforma executiva integrada ao motor cognitivo
              PecuariaTech com rastreabilidade inteligente,
              brincos IoT, sanidade operacional, pressão animal,
              compliance biológico e governança estrutural contínua.
            </p>

          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-4
              lg:w-[420px]
            "
          >

            <div
              className="
                rounded-3xl
                border
                border-emerald-400/20
                bg-white/5
                p-5
              "
            >
              <div className="text-xs tracking-[0.2em] text-emerald-200">
                SCORE BIOLÓGICO
              </div>

              <div
                className="
                  mt-3
                  text-5xl
                  font-black
                  text-white
                "
              >
                {scoreBiologico}
              </div>
            </div>

            <div
              className="
                rounded-3xl
                border
                border-emerald-400/20
                bg-white/5
                p-5
              "
            >
              <div className="text-xs tracking-[0.2em] text-emerald-200">
                RISCO OPERACIONAL
              </div>

              <div
                className="
                  mt-4
                  text-2xl
                  font-black
                  text-emerald-300
                "
              >
                {risco}
              </div>
            </div>

            <div
              className="
                rounded-3xl
                border
                border-emerald-400/20
                bg-white/5
                p-5
              "
            >
              <div className="text-xs tracking-[0.2em] text-emerald-200">
                COMPLIANCE
              </div>

              <div
                className="
                  mt-3
                  text-4xl
                  font-black
                  text-white
                "
              >
                {compliance}%
              </div>
            </div>

            <div
              className="
                rounded-3xl
                border
                border-emerald-400/20
                bg-white/5
                p-5
              "
            >
              <div className="text-xs tracking-[0.2em] text-emerald-200">
                STATUS
              </div>

              <div
                className="
                  mt-4
                  inline-flex
                  rounded-full
                  bg-emerald-500/20
                  px-4
                  py-2
                  text-sm
                  font-black
                  tracking-[0.2em]
                  text-emerald-100
                "
              >
                ONLINE
              </div>
            </div>

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

      {/* =====================================================
          VISÃO EXECUTIVA
      ===================================================== */}

      <div
        className="
          grid
          gap-6
          lg:grid-cols-3
        "
      >

        <div
          className="
            rounded-[34px]
            border
            border-emerald-100
            bg-white
            p-8
            shadow-sm
          "
        >

          <div
            className="
              text-xs
              font-black
              tracking-[0.25em]
              text-emerald-700
            "
          >
            GOVERNANÇA EXECUTIVA
          </div>

          <div
            className="
              mt-5
              text-lg
              leading-relaxed
              text-slate-700
            "
          >
            {runtimeAI?.executivo ||
              "Governança biológica sincronizada."}
          </div>

        </div>

        <div
          className="
            rounded-[34px]
            border
            border-emerald-100
            bg-white
            p-8
            shadow-sm
          "
        >

          <div
            className="
              text-xs
              font-black
              tracking-[0.25em]
              text-emerald-700
            "
          >
            MOTOR OPERACIONAL
          </div>

          <div
            className="
              mt-5
              text-lg
              leading-relaxed
              text-slate-700
            "
          >
            {runtimeAI?.operacional ||
              "Operação estabilizada via IA cognitiva."}
          </div>

        </div>

        <div
          className="
            rounded-[34px]
            border
            border-emerald-100
            bg-white
            p-8
            shadow-sm
          "
        >

          <div
            className="
              text-xs
              font-black
              tracking-[0.25em]
              text-emerald-700
            "
          >
            MOTOR TÁTICO
          </div>

          <div
            className="
              mt-5
              text-lg
              leading-relaxed
              text-slate-700
            "
          >
            {runtimeAI?.tatico ||
              "Sincronismo operacional contínuo."}
          </div>

        </div>

      </div>

      {/* =====================================================
          TABELA EXECUTIVA
      ===================================================== */}

      <div
        className="
          overflow-x-auto
          rounded-[36px]
          border
          border-white/40
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            flex
            flex-col
            gap-5
            border-b
            border-slate-100
            p-7
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <div
              className="
                text-2xl
                font-black
                text-slate-900
              "
            >
              Rebanho Inteligente
            </div>

            <div
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Rastreabilidade biológica • Brincos inteligentes • Governança operacional
            </div>

          </div>

          <div className="w-full lg:w-[420px]">

            <input
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="Buscar animal, raça, status..."
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-5
                py-3
                text-sm
                outline-none
                focus:border-emerald-300
                focus:ring-4
                focus:ring-emerald-100
              "
            />

          </div>

        </div>

        <table
          className="
            min-w-full
            text-sm
          "
        >

          <thead
            className="
              bg-slate-50
            "
          >

            <tr>

              <th className="p-5 text-left font-black text-slate-600">
                Brinco
              </th>

              <th className="p-5 text-left font-black text-slate-600">
                Raça
              </th>

              <th className="p-5 text-left font-black text-slate-600">
                Sexo
              </th>

              <th className="p-5 text-right font-black text-slate-600">
                Peso
              </th>

              <th className="p-5 text-left font-black text-slate-600">
                Status Biológico
              </th>

              <th className="p-5 text-left font-black text-slate-600">
                Localização
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((a) => (

              <tr
                key={a.animal_id}
                className="
                  border-t
                  border-slate-100
                  transition-all
                  hover:bg-emerald-50/40
                "
              >

                <td className="p-5 font-bold">
                  {a.brinco}
                </td>

                <td className="p-5">
                  {a.raca}
                </td>

                <td className="p-5">
                  {a.sexo}
                </td>

                <td className="p-5 text-right font-semibold">
                  {a.peso ?? "—"} kg
                </td>

                <td className="p-5">

                  <span
                    className="
                      rounded-full
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-4
                      py-2
                      text-xs
                      font-black
                      tracking-[0.2em]
                      text-emerald-700
                    "
                  >
                    {a.status_biologico}
                  </span>

                </td>

                <td className="p-5">
                  {a.ultima_localizacao}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}