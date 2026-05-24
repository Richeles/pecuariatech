import ExecutiveChart
from "@/app/components/dashboard/ExecutiveChart";

import ExecutiveAnalyticsGrid
from "@/app/components/dashboard/ExecutiveAnalyticsGrid";

import CFOAIInsights
from "@/app/components/cfo/CFOAIInsights";

import PAIAICenter
from "@/app/dashboard/ai/components/PAIAICenter";

/* =========================================================
   PECUARIATECH
   ULTRA EXECUTIVE HUB
   VERDE GRAMA TECNOLÓGICO
   TRIÂNGULO ESPELHADO 360
   EQUAÇÃO Y + EQUAÇÃO Z
========================================================= */

export default function DashboardExecutivePage() {

  return (

    <main
      className="
        min-h-screen
        bg-[#E8F5E9]
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
            relative
            overflow-hidden
            rounded-[36px]
            border
            border-[#D8F3DC]/20
            bg-gradient-to-br
            from-[#4D9A6D]
            via-[#5FB981]
            to-[#3B7D57]
            p-10
            shadow-[0_0_90px_rgba(34,197,94,0.18)]
          "
        >

          {/* FX */}

          <div
            className="
              absolute
              right-[-140px]
              top-[-140px]
              h-[360px]
              w-[360px]
              rounded-full
              bg-[#DCFCE7]/20
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-[-140px]
              left-[-140px]
              h-[360px]
              w-[360px]
              rounded-full
              bg-[#86EFAC]/15
              blur-3xl
            "
          />

          <div
            className="
              relative
              z-10
              flex
              items-center
              justify-between
              gap-8
              flex-wrap
            "
          >

            <div>

              {/* STATUS */}

              <div
                className="
                  inline-flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-[#DCFCE7]/20
                  bg-[#BBF7D0]/25
                  px-5
                  py-2
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.20em]
                  text-[#F0FFF4]
                  backdrop-blur-xl
                "
              >

                <div
                  className="
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-[#DCFCE7]
                    animate-pulse
                  "
                />

                Runtime Cognitivo Online

              </div>

              {/* TITLE */}

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

              {/* SUBTITLE */}

              <h2
                className="
                  mt-3
                  text-5xl
                  font-bold
                  tracking-tight
                  text-[#F0FFF4]
                "
              >
                Executive Ultra Dashboard
              </h2>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-6
                  max-w-4xl
                  text-xl
                  leading-relaxed
                  text-[#ECFDF5]
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
            CFO AI PREMIUM
        ================================================= */}

        <section
          className="
            w-full
          "
        >

          <CFOAIInsights />

        </section>

      </div>

    </main>

  );
}