"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type RuntimeAI = {
  runtime?: string;
  advisory?: string[];
  diagnostico?: {
    score_estrutural?: number;
  };
};

type Alerta = {
  tipo:
    | "critico"
    | "atencao"
    | "info";

  titulo: string;

  detalhe: string;
};

type Piquete = {
  piquete_id: string;

  nome: string;

  area_ha: number | null;

  tipo_pasto: string | null;

  capacidade_ua: number | null;

  status: string | null;

  ultima_movimentacao:
    | string
    | null;
};

type ApiResp = {
  ok: boolean;

  fonte?: string;

  error?: string;

  kpis?: {
    total_piquetes: number;

    disponiveis: number;

    ocupados: number;

    area_total_ha: number;

    capacidade_total_ua: number;

    taxa_ocupacao: number;
  };

  alertas?: Alerta[];

  piquetes?: Piquete[];
};

/* =========================================================
   BADGE
========================================================= */

function badge(
  tipo: Alerta["tipo"]
) {

  if (tipo === "critico") {

    return `
      bg-red-500/10
      text-red-700
      border-red-300
    `;
  }

  if (tipo === "atencao") {

    return `
      bg-yellow-500/10
      text-yellow-700
      border-yellow-300
    `;
  }

  return `
    bg-slate-500/10
    text-slate-700
    border-slate-300
  `;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function PastagemClient() {

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    erro,
    setErro,
  ] =
    useState<
      string | null
    >(null);

  const [
    data,
    setData,
  ] =
    useState<
      ApiResp | null
    >(null);

  const [
    runtimeAI,
    setRuntimeAI,
  ] =
    useState<
      RuntimeAI | null
    >(null);

  const [
    busca,
    setBusca,
  ] =
    useState("");

  /* =====================================================
     LOAD
  ===================================================== */

  async function carregar() {

    setLoading(true);

    setErro(null);

    try {

      const res =
        await fetch(
          "/api/pastagem/status",
          {
            cache:
              "no-store",
          }
        );

      const json =
        await res.json();

      if (!json.ok) {

        throw new Error(
          json.error ||
          "Falha na API."
        );
      }

      setData(json);

      try {

        const ai =
          await fetch(
            "/api/ai/pastagem",
            {
              cache:
                "no-store",
            }
          );

        const aiJson =
          await ai.json();

        setRuntimeAI(
          aiJson
        );

      } catch {

        setRuntimeAI(
          null
        );
      }

    } catch (
      e: any
    ) {

      setErro(
        e?.message ||
        "Erro inesperado."
      );

    } finally {

      setLoading(
        false
      );
    }
  }

  /* =====================================================
     INIT
  ===================================================== */

  useEffect(() => {

    carregar();

  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const piquetes =
    useMemo(() => {

      const rows =
        data?.piquetes ||
        [];

      if (!busca) {
        return rows;
      }

      return rows.filter(
        (p) => {

          const s =
            `
              ${p.nome}
              ${p.status}
              ${p.tipo_pasto}
            `
              .toLowerCase();

          return s.includes(
            busca.toLowerCase()
          );
        }
      );

    }, [
      data,
      busca,
    ]);

  /* =====================================================
     KPI
  ===================================================== */

  const k =
    data?.kpis;

  /* =====================================================
     PI SCORE
  ===================================================== */

  const piScore =
    runtimeAI
      ?.diagnostico
      ?.score_estrutural ||
    94;

  const piColor =
    piScore >= 80
      ? "text-[#06351f]"
      : piScore >= 60
      ? "text-yellow-600"
      : "text-red-600";

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="p-10 text-slate-500">

        Inicializando runtime cognitivo...

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (erro) {

    return (

      <div className="p-10 text-red-500">

        {erro}

      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div
      className="
        min-h-screen
        bg-[#eef4ef]
        text-[#0f172a]
        p-6
      "
    >

      {/* =====================================================
          TITLE
      ===================================================== */}

      <div className="mb-10">

        <h1
          className="
            text-5xl
            font-black
            tracking-tight
          "
        >
          Pastagem
        </h1>

        <p
          className="
            mt-3
            text-lg
            text-slate-500
          "
        >
          Gestão operacional das áreas,
          pressão de pastejo
          e risco produtivo.
        </p>

      </div>

      {/* =====================================================
          RUNTIME PREMIUM
      ===================================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[42px]
          border
          border-[#4f9b68]
          bg-gradient-to-r
          from-[#6fc48e]
          via-[#59b67c]
          to-[#6fc48e]
          p-10
          shadow-[0_25px_80px_rgba(16,185,129,0.22)]
          mb-10
        "
      >

        {/* Glow */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_40%)]
          "
        />

        {/* Content */}

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

          {/* LEFT */}

          <div>

            <div
              className="
                text-4xl
                font-black
                tracking-tight
                text-[#06351f]
              "
            >
              Runtime Cognitivo Online
            </div>

            <div
              className="
                mt-3
                text-lg
                font-semibold
                text-[#14532d]
              "
            >
              Symbiosis Python +
              Cofatores Triangulares ativos.
            </div>

          </div>

          {/* RIGHT */}

          <div
            className="
              rounded-full
              border
              border-white/30
              bg-white/20
              px-6
              py-3
              backdrop-blur
              shadow-lg
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  h-3
                  w-3
                  rounded-full
                  bg-[#d7ffe5]
                  animate-pulse
                "
              />

              <div
                className="
                  text-sm
                  font-black
                  tracking-[0.2em]
                  text-[#06351f]
                "
              >
                ONLINE
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          KPI GRID
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-5
          gap-5
          mb-10
        "
      >

        {[
          [
            "Piquetes",
            k?.total_piquetes,
          ],

          [
            "Disponíveis",
            k?.disponiveis,
          ],

          [
            "Ocupados",
            k?.ocupados,
          ],

          [
            "Área (ha)",
            k?.area_total_ha,
          ],

          [
            "UA Total",
            k?.capacidade_total_ua,
          ],

        ].map(
          (
            item,
            idx
          ) => (

            <div
              key={idx}
              className="
                rounded-[28px]
                border
                border-white/40
                bg-white/80
                p-6
                shadow-sm
              "
            >

              <div
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-slate-400
                "
              >
                {item[0]}
              </div>

              <div
                className="
                  mt-4
                  text-5xl
                  font-black
                  ${piColor}
                "
              >
                {item[1] || 0}
              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}