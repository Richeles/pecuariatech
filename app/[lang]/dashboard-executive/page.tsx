import ExecutiveChart
from "@/app/components/dashboard/ExecutiveChart";

import ExecutiveAnalyticsGrid
from "@/app/components/dashboard/ExecutiveAnalyticsGrid";

import CFOAIInsights
from "@/app/components/cfo/CFOAIInsights";

import CFORealCard
from "@/app/components/cfo/CFORealCard";

import PAIAICenter
from "@/app/dashboard/ai/components/PAIAICenter";

/* =========================================================
   PECUARIATECH
   ULTRA EXECUTIVE HUB
   TRIÂNGULO ESPELHADO 360
   EQUAÇÃO Y + EQUAÇÃO Z
========================================================= */

export default function DashboardExecutivePage() {

  return (

    <main
      className="
        min-h-screen
        bg-[#06110b]
        p-8
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
          space-y-8
        "
      >

        {/* =================================================
            HERO EXECUTIVO
        ================================================= */}

        <section
          className="
            rounded-[36px]
            border
            border-emerald-500/10
            bg-gradient-to-br
            from-[#07150f]
            via-[#0b2017]
            to-[#10271d]
            p-10
            shadow-[0_0_80px_rgba(16,185,129,0.10)]
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-8
              flex-wrap
            "
          >

            <div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-emerald-400/20
                  bg-emerald-500/10
                  px-5
                  py-2
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.20em]
                  text-emerald-300
                "
              >

                <div
                  className="
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-green-400
                    animate-pulse
                  "
                />

                Runtime Cognitivo Online

              </div>

              <h1
                className="
                  mt-8
                  text-7xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                PecuariaTech
              </h1>

              <h2
                className="
                  mt-3
                  text-5xl
                  font-bold
                  tracking-tight
                  text-emerald-100
                "
              >
                Executive Ultra Dashboard
              </h2>

              <p
                className="
                  mt-6
                  max-w-4xl
                  text-xl
                  leading-relaxed
                  text-emerald-50/70
                "
              >
                Runtime executivo cognitivo integrado ao
                financeiro, rebanho, pastagem, engorda e
                governança operacional da fazenda.
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            PAI AI CENTER
        ================================================= */}

        <PAIAICenter />

        {/* =================================================
            CHART EXECUTIVO
        ================================================= */}

        <ExecutiveChart />

        {/* =================================================
            GRID ANALÍTICO
        ================================================= */}

        <ExecutiveAnalyticsGrid />

        {/* =================================================
            CFO AI
        ================================================= */}

        <section
          className="
            grid
            gap-8
            xl:grid-cols-2
          "
        >

          <CFORealCard />

          <CFOAIInsights />

        </section>

      </div>

    </main>

  );
}