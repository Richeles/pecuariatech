"use client";

import PastagemResumoCard from "./ui/PastagemResumoCard";

import PastagemPiquetesTable from "./ui/PastagemPiquetesTable";

import PastagemAlertasCard from "./ui/PastagemAlertasCard";

import PastagemTriangulo360 from "./ui/PastagemTriangulo360";

import PastagemAIInsights from "./ui/PastagemAIInsights";

type Props = {

  resumo: any;

  piquetes: any[];

  alertas: any[];
};

export default function UltraBiologicoPastagem({

  resumo,
  piquetes,
  alertas,

}: Props) {

  const risco = String(
    resumo?.risco_pastagem ??
    "DESCONHECIDO"
  );

  return (

    <div className="space-y-8 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        className="
          rounded-[36px]
          border
          border-emerald-100
          bg-white
          p-6
          shadow-sm
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-start
            md:justify-between
          "
        >

          <div>

            <h1
              className="
                text-2xl
                font-black
                text-gray-950
              "
            >
              Ultra Biológico — Pastagem
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-gray-600
              "
            >
              Gestão técnica operacional integrada ao Triângulo 360.
              Não é prescrição.
            </p>

          </div>

          <div
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-emerald-200
              bg-emerald-50
              px-4
              py-2
              text-xs
              font-bold
              text-emerald-700
            "
          >
            RISCO: {risco}
          </div>

        </div>

      </section>

      {/* =====================================================
          RESUMO
      ===================================================== */}

      <PastagemResumoCard
        resumo={resumo}
      />

      {/* =====================================================
          TRIANGULO 360
      ===================================================== */}

      <PastagemTriangulo360
        resumo={resumo}
      />

      {/* =====================================================
          IA COGNITIVA
      ===================================================== */}

      <PastagemAIInsights />

      {/* =====================================================
          ALERTAS
      ===================================================== */}

      <PastagemAlertasCard
        alertas={alertas}
      />

      {/* =====================================================
          PIQUETES
      ===================================================== */}

      <PastagemPiquetesTable
        piquetes={piquetes}
      />

    </div>
  );
}