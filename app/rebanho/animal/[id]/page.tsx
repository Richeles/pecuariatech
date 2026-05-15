// app/rebanho/animal/[id]/page.tsx
// PecuariaTech Runtime
// Animal IA Runtime
// Next.js 16 + Type Safe Runtime
// Equação X + Equação Y + Regra Z
//
// Runtime:
// ✔ type-safe
// ✔ runtime estável
// ✔ compatível com resolverCapacidadeIA
// ✔ sem componente fantasma
// ✔ sem placeholder inválido
// ✔ compatível com Turbopack
// ✔ compatível com Next.js 16

"use client";

/* =====================================================
   IMPORTS
===================================================== */

import {

  resolverCapacidadeIA,

  type PlanoIA,

} from "@/app/lib/ia/resolverCapacidadeIA";

/* =====================================================
   PAGE
===================================================== */

export default function AnimalPage() {

  /* ==========================================
     MOCK TEMPORÁRIO ESTÁVEL
  ========================================== */

  const plano =
    "basico" as PlanoIA;

  const ia = {

    diagnostico:
      "Animal com estabilidade clínica e operacional.",

    recomendacao:
      "Manter protocolo nutricional e monitoramento semanal.",
  };

  /* ==========================================
     CAPACIDADES IA
  ========================================== */

  const capacidades =
    resolverCapacidadeIA(
      plano
    );

  /* ==========================================
     RENDER
  ========================================== */

  return (

    <main
      className="
        min-h-screen
        bg-neutral-50
        p-6
      "
    >

      <div
        className="
          mx-auto
          max-w-5xl
        "
      >

        {/* =====================================
            HEADER
        ===================================== */}

        <div
          className="
            mb-8
          "
        >

          <h1
            className="
              text-3xl
              font-black
              text-green-700
            "
          >
            Inteligência Animal
          </h1>

          <p
            className="
              mt-2
              text-neutral-600
            "
          >
            Runtime cognitivo do PecuariaTech.
          </p>

        </div>

        {/* =====================================
            GRID
        ===================================== */}

        <div
          className="
            grid
            gap-6
            lg:grid-cols-2
          "
        >

          {/* =================================
              DIAGNÓSTICO
          ================================= */}

          <div
            className="
              rounded-2xl
              border
              border-neutral-200
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                text-sm
                font-semibold
                uppercase
                tracking-wide
                text-neutral-500
              "
            >
              Diagnóstico
            </div>

            <div
              className="
                mt-4
                text-neutral-800
              "
            >
              {ia.diagnostico}
            </div>

          </div>

          {/* =================================
              RECOMENDAÇÃO
          ================================= */}

          <div
            className="
              rounded-2xl
              border
              border-neutral-200
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                text-sm
                font-semibold
                uppercase
                tracking-wide
                text-neutral-500
              "
            >
              Recomendação
            </div>

            <div
              className="
                mt-4
                text-neutral-800
              "
            >
              {ia.recomendacao}
            </div>

          </div>

        </div>

        {/* =====================================
            CAPACIDADES IA
        ===================================== */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-neutral-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <div
            className="
              text-sm
              font-semibold
              uppercase
              tracking-wide
              text-neutral-500
            "
          >
            Capacidades IA
          </div>

          <pre
            className="
              mt-4
              overflow-auto
              rounded-xl
              bg-neutral-100
              p-4
              text-xs
              text-neutral-800
            "
          >
            {JSON.stringify(
              capacidades,
              null,
              2
            )}
          </pre>

        </div>

      </div>

    </main>
  );
}