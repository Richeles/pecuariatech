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
          border-[#294437]
          bg-gradient-to-br
          from-[#173126]
          via-[#1d3b2d]
          to-[#14281f]
          p-10
          shadow-[0_10px_60px_rgba(0,0,0,0.28)]
        "
      >

        {/* OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-[#52b788]/10
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

            {/* =====================================================
                LEFT
            ===================================================== */}

            <div className="max-w-4xl">

              {/* TAG */}

              <div
                className="
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-[#3f6b55]
                  bg-[#1e3d2f]
                  px-5
                  py-2
                  text-[11px]
                  font-black
                  uppercase
                  tracking-[0.24em]
                  text-[#b7d6c2]
                  shadow-lg
                "
              >
                PECUARIATECH COGNITIVE RUNTIME
              </div>

              {/* TITLE */}

              <h1
                className="
                  mt-7
                  text-5xl
                  font-black
                  tracking-tight
                  text-[#f3fff7]
                "
              >
                Ultra Biológico — Pastagem
              </h1>

              {/* SUBTITLE */}

              <p
                className="
                  mt-6
                  max-w-3xl
                  text-[15px]
                  leading-relaxed
                  text-[#b7d6c2]
                "
              >
                Plataforma biológica operacional integrada
                ao Triângulo 360 com runtime cognitivo,
                cofatores triangulares e leitura contínua
                de pressão de pastagem em tempo real.
              </p>

              {/* =====================================================
                  KPI
              ===================================================== */}

              <div
                className="
                  mt-10
                  grid
                  grid-cols-2
                  gap-4
                  xl:grid-cols-4
                "
              >

                {/* PIQUETES */}

                <div
                  className="
                    rounded-3xl
                    border
                    border-[#355845]
                    bg-[#1a3327]
                    p-5
                    shadow-xl
                  "
                >

                  <div
                    className="
                      text-xs
                      uppercase
                      tracking-[0.14em]
                      text-[#8eb59d]
                    "
                  >
                    Piquetes
                  </div>

                  <div
                    className="
                      mt-3
                      text-4xl
                      font-black
                      text-[#f3fff7]
                    "
                  >
                    {safeText(resumo?.qtd_piquetes ?? 0)}
                  </div>

                </div>

                {/* PRESSÃO */}

                <div
                  className="
                    rounded-3xl
                    border
                    border-[#355845]
                    bg-[#1a3327]
                    p-5
                    shadow-xl
                  "
                >

                  <div
                    className="
                      text-xs
                      uppercase
                      tracking-[0.14em]
                      text-[#8eb59d]
                    "
                  >
                    Pressão
                  </div>

                  <div
                    className="
                      mt-3
                      text-4xl
                      font-black
                      text-[#f3fff7]
                    "
                  >
                    {safeText(
                      resumo?.pressao_pastagem_score ?? 0
                    )}
                  </div>

                </div>

                {/* UA */}

                <div
                  className="
                    rounded-3xl
                    border
                    border-[#355845]
                    bg-[#1a3327]
                    p-5
                    shadow-xl
                  "
                >

                  <div
                    className="
                      text-xs
                      uppercase
                      tracking-[0.14em]
                      text-[#8eb59d]
                    "
                  >
                    UA/ha
                  </div>

                  <div
                    className="
                      mt-3
                      text-4xl
                      font-black
                      text-[#f3fff7]
                    "
                  >
                    {safeText(
                      resumo?.ua_por_ha_atual ?? 0
                    )}
                  </div>

                </div>

                {/* RISCO */}

                <div
                  className="
                    rounded-3xl
                    border
                    border-[#6a3a3a]
                    bg-[#3a1f1f]
                    p-5
                    shadow-xl
                  "
                >

                  <div
                    className="
                      text-xs
                      uppercase
                      tracking-[0.14em]
                      text-[#d6b0b0]
                    "
                  >
                    Risco
                  </div>

                  <div
                    className="
                      mt-3
                      text-3xl
                      font-black
                      text-[#ffd6d6]
                    "
                  >
                    {risco}
                  </div>

                </div>

              </div>

            </div>

            {/* =====================================================
                RIGHT
            ===================================================== */}

            <div
              className="
                w-full
                xl:max-w-[360px]
                space-y-5
              "
            >

              {/* ONLINE */}

              {runtimeOnline ? (

                <div
                  className="
                    rounded-[30px]
                    border
                    border-[#3f6b55]
                    bg-[#1d3b2d]
                    p-6
                    shadow-xl
                  "
                >

                  <div
                    className="
                      text-[11px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-[#8eb59d]
                    "
                  >
                    Runtime Cognitivo
                  </div>

                  <div
                    className="
                      mt-3
                      text-3xl
                      font-black
                      text-[#f3fff7]
                    "
                  >
                    ONLINE
                  </div>

                  <div
                    className="
                      mt-4
                      text-xs
                      leading-relaxed
                      text-[#b7d6c2]
                    "
                  >
                    Symbiosis Runtime • IA Cognitiva • Governança operacional ativa
                  </div>

                </div>

              ) : (

                /* FALLBACK */

                <div
                  className="
                    rounded-[30px]
                    border
                    border-[#355845]
                    bg-[#1d3328]
                    p-6
                    shadow-xl
                  "
                >

                  <div
                    className="
                      text-[11px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-[#8eb59d]
                    "
                  >
                    Runtime Fallback
                  </div>

                  <div
                    className="
                      mt-3
                      text-2xl
                      font-black
                      text-[#f3fff7]
                    "
                  >
                    Governança Preservada
                  </div>

                  <div
                    className="
                      mt-4
                      text-xs
                      leading-relaxed
                      text-[#b7d6c2]
                    "
                  >
                    Runtime em fallback estrutural.
                    Dashboard operacional continua protegido.
                  </div>

                </div>

              )}

              {/* DECISÃO */}

              <div
                className="
                  rounded-[30px]
                  border
                  border-[#355845]
                  bg-[#1a3327]
                  p-6
                  shadow-xl
                "
              >

                <div
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.22em]
                    text-[#8eb59d]
                  "
                >
                  Decisão Recomendada
                </div>

                <div
                  className="
                    mt-4
                    text-2xl
                    font-black
                    text-[#f3fff7]
                  "
                >
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

      {/* =====================================================
          RESUMO
      ===================================================== */}

      <PastagemResumoCard resumo={resumo} />

      {/* =====================================================
          TRIÂNGULO
      ===================================================== */}

      <PastagemTriangulo360 resumo={resumo} />

      {/* =====================================================
          IA
      ===================================================== */}

      <PastagemAIInsights />

      {/* =====================================================
          ALERTAS
      ===================================================== */}

      <PastagemAlertasCard alertas={alertas} />

      {/* =====================================================
          PIQUETES
      ===================================================== */}

      <PastagemPiquetesTable piquetes={piquetes} />

    </div>
  );
}