"use client";

import PastagemResumoCard from "./ui/PastagemResumoCard";
import PastagemPiquetesTable from "./ui/PastagemPiquetesTable";
import PastagemAlertasCard from "./ui/PastagemAlertasCard";
import PastagemTriangulo360 from "./ui/PastagemTriangulo360";
import PastagemAIInsights from "./ui/PastagemAIInsights";

// ======================================================
// TYPES
// ======================================================

type RuntimeStatus =
  | "ONLINE"
  | "DEGRADED"
  | "OFFLINE";

type RuntimePayload = {
  runtime_online?: boolean;
  runtime_status?: RuntimeStatus;
  cofator_triangular?: string;
  executivo?: string;
  operacional?: string;
  tatico?: string;
};

type Props = {
  resumo: any;
  piquetes: any[];
  alertas: any[];
  runtime?: RuntimePayload | null;
};

// ======================================================
// SAFE ENGINE
// ======================================================

function safeText(v: any): string {

  if (
    v === null ||
    v === undefined
  ) {
    return "";
  }

  if (
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  ) {
    return String(v);
  }

  if (
    Array.isArray(v)
  ) {

    return v
      .map(safeText)
      .filter(Boolean)
      .join(" • ");
  }

  if (
    typeof v === "object"
  ) {

    try {

      return JSON.stringify(v);

    } catch {

      return "[objeto]";
    }
  }

  return String(v);
}

// ======================================================
// COMPONENT
// ======================================================

export default function UltraBiologicoPastagem({

  resumo,
  piquetes,
  alertas,
  runtime,

}: Props) {

  const risco =
    safeText(
      resumo?.risco_pastagem ??
      "DESCONHECIDO"
    );

  const runtimeOnline =
    runtime?.runtime_online === true;

  return (

    <div className="space-y-8 p-6">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[42px]
          border
          border-emerald-100
          bg-white
          p-10
          shadow-[0_10px_60px_rgba(0,0,0,0.06)]
        "
      >

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-emerald-500/5
            to-transparent
          "
        />

        <div className="relative z-10">

          <div
            className="
              flex
              flex-col
              gap-10
              xl:flex-row
              xl:items-start
              xl:justify-between
            "
          >

            {/* LEFT */}

            <div className="max-w-4xl">

              <div
                className="
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-5
                  py-2
                  text-[11px]
                  font-black
                  uppercase
                  tracking-[0.24em]
                  text-emerald-700
                "
              >
                PECUARIATECH COGNITIVE RUNTIME
              </div>

              <h1
                className="
                  mt-7
                  text-5xl
                  font-black
                  tracking-tight
                  text-gray-950
                "
              >
                Ultra Biológico — Pastagem
              </h1>

              <p
                className="
                  mt-6
                  max-w-3xl
                  text-[15px]
                  leading-relaxed
                  text-gray-600
                "
              >
                Plataforma biológica operacional integrada
                ao Triângulo 360 com runtime cognitivo,
                cofatores triangulares e leitura contínua
                de pressão de pastagem em tempo real.
              </p>

              {/* KPI */}

              <div
                className="
                  mt-10
                  grid
                  grid-cols-2
                  gap-4
                  xl:grid-cols-4
                "
              >

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                    Piquetes
                  </div>

                  <div className="mt-3 text-4xl font-black text-gray-950">
                    {safeText(resumo?.qtd_piquetes ?? 0)}
                  </div>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                    Pressão
                  </div>

                  <div className="mt-3 text-4xl font-black text-gray-950">
                    {safeText(resumo?.pressao_pastagem_score ?? 0)}
                  </div>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                    UA/ha
                  </div>

                  <div className="mt-3 text-4xl font-black text-gray-950">
                    {safeText(resumo?.ua_por_ha_atual ?? 0)}
                  </div>
                </div>

                <div className="rounded-3xl border bg-red-50 p-5 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.14em] text-gray-500">
                    Risco
                  </div>

                  <div className="mt-3 text-3xl font-black text-red-700">
                    {risco}
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div className="w-full xl:max-w-[360px] space-y-5">

              {runtimeOnline ? (

                <div
                  className="
                    rounded-[30px]
                    border
                    border-emerald-500/20
                    bg-emerald-500/10
                    p-6
                  "
                >

                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                    Runtime Cognitivo
                  </div>

                  <div className="mt-3 text-3xl font-black text-emerald-950">
                    ONLINE
                  </div>

                  <div className="mt-4 text-xs leading-relaxed text-emerald-900">
                    Symbiosis Runtime • IA Cognitiva • Governança operacional ativa
                  </div>

                </div>

              ) : (

                <div
                  className="
                    rounded-[30px]
                    border
                    border-amber-400/20
                    bg-amber-50
                    p-6
                  "
                >

                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">
                    Runtime Fallback
                  </div>

                  <div className="mt-3 text-2xl font-black text-amber-950">
                    Governança Preservada
                  </div>

                  <div className="mt-4 text-xs leading-relaxed text-amber-800">
                    Runtime em fallback estrutural. Dashboard operacional continua protegido.
                  </div>

                </div>

              )}

              <div className="rounded-[30px] border bg-gray-50 p-6">

                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">
                  Decisão Recomendada
                </div>

                <div className="mt-4 text-2xl font-black text-gray-950">
                  {safeText(
                    resumo?.decisao_recomendada ??
                    "SEM DECISÃO"
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* RESUMO */}

      <PastagemResumoCard resumo={resumo} />

      {/* TRIANGULO */}

      <PastagemTriangulo360 resumo={resumo} />

      {/* IA */}

      <PastagemAIInsights />

      {/* ALERTAS */}

      <PastagemAlertasCard alertas={alertas} />

      {/* PIQUETES */}

      <PastagemPiquetesTable piquetes={piquetes} />

    </div>
  );
}