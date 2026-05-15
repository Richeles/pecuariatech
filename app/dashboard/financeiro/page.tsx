// =========================================================
// PecuariaTech
// Financeiro Runtime Premium
// Equação Y + Triângulo 360
// =========================================================

import FinanceiroClient
  from "./FinanceiroClient";

/* =========================================================
   NEXT
========================================================= */

export const dynamic =
  "force-static";

/* =========================================================
   PAGE
========================================================= */

export default function FinanceiroPage() {

  return (

    <main
      className="
        mx-auto
        max-w-7xl
        space-y-10
        p-8
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <section
        className="
          rounded-3xl
          border
          border-emerald-100
          bg-gradient-to-br
          from-emerald-50
          via-white
          to-green-50
          p-8
          shadow-sm
        "
      >

        <div className="space-y-4">

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-emerald-200
              bg-white
              px-4
              py-2
              text-sm
              font-semibold
              text-emerald-700
            "
          >
            🧠 CFO ULTRA Runtime
          </div>

          <h1
            className="
              text-4xl
              font-black
              tracking-tight
              text-gray-900
            "
          >
            Financeiro Inteligente
          </h1>

          <p
            className="
              max-w-3xl
              text-sm
              leading-relaxed
              text-gray-600
            "
          >
            Runtime financeiro desacoplado,
            preparado para análises cognitivas,
            IA operacional e evolução autônoma.
          </p>

        </div>

      </section>

      {/* =================================================
          CLIENT RUNTIME
      ================================================= */}

      <FinanceiroClient />

    </main>
  );
}