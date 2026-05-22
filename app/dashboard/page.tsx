"use client";

import T from "@/app/components/T";

import CFORealCard
  from "@/app/components/cfo/CFORealCard";

import CFOAIInsights
  from "@/app/components/cfo/CFOAIInsights";

import ExecutiveChart
  from "@/app/components/dashboard/ExecutiveChart";

/* =========================================================
   PECUARIATECH
   ULTRA PREMIUM BIOLOGICAL RUNTIME
   TRIÂNGULO ESPELHADO 360
   EQUAÇÃO Y + EQUAÇÃO Z
========================================================= */

export default function DashboardHome() {

  const modules = [

    {
      titlePt:
        "Inteligência Financeira",

      titleEs:
        "Inteligencia Financiera",

      descPt:
        "Gestão financeira estratégica integrada ao runtime operacional.",

      descEs:
        "Gestión financiera estratégica integrada al runtime operacional.",

      icon: "💰",

      glow:
        "from-emerald-500/20 to-green-500/5",
    },

    {
      titlePt:
        "Rebanho Inteligente",

      titleEs:
        "Rebaño Inteligente",

      descPt:
        "Rastreamento produtivo, sanitário e operacional do rebanho.",

      descEs:
        "Rastreo productivo, sanitario y operacional del rebaño.",

      icon: "🐄",

      glow:
        "from-cyan-500/20 to-emerald-500/5",
    },

    {
      titlePt:
        "Pastagem Inteligente",

      titleEs:
        "Pastura Inteligente",

      descPt:
        "Controle de lotação, capacidade de suporte e eficiência do pasto.",

      descEs:
        "Control de carga animal, capacidad de soporte y eficiencia del pasto.",

      icon: "🌱",

      glow:
        "from-lime-500/20 to-emerald-500/5",
    },

    {
      titlePt:
        "Engorda ULTRA",

      titleEs:
        "Engorda ULTRA",

      descPt:
        "Eficiência alimentar, projeção operacional e inteligência biológica.",

      descEs:
        "Eficiencia alimentaria, proyección operacional e inteligencia biológica.",

      icon: "⚡",

      glow:
        "from-yellow-500/20 to-orange-500/5",
    },
  ];

  return (

    <main
      className="
        min-h-screen
        bg-[#f3f7f4]
        pb-16
      "
    >

      {/* =====================================================
          WRAPPER
      ===================================================== */}

      <div
        className="
          mx-auto
          max-w-[1820px]
          space-y-8
        "
      >

        {/* =====================================================
            HERO EXECUTIVO
        ===================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[34px]
            border
            border-emerald-900/20
            bg-gradient-to-br
            from-[#03150d]
            via-[#062317]
            to-[#0b2e1f]
            px-8
            py-8
            xl:px-12
            xl:py-10
            shadow-[0_0_80px_rgba(16,185,129,0.10)]
          "
        >

          <div
            className="
              absolute
              -top-40
              right-[-120px]
              h-[420px]
              w-[420px]
              rounded-full
              bg-emerald-400/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              inset-0
              opacity-[0.03]
              bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)]
              bg-[size:80px_80px]
            "
          />

          <div className="relative z-10">

            {/* TOP BAR */}

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >

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
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-emerald-300
                  backdrop-blur-xl
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

                <T
                  pt="IA operacional estabilizada"
                  es="IA operacional estabilizada"
                />

              </div>

              <div
                className="
                  rounded-full
                  border
                  border-white/10
                  bg-black/20
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  tracking-wide
                  text-emerald-100/70
                "
              >
                TRIÂNGULO 360 • EQUAÇÃO Y • EQUAÇÃO Z
              </div>

            </div>

            {/* TITLES */}

            <div className="mt-6 max-w-4xl">

              <h1
                className="
                  text-4xl
                  font-black
                  leading-tight
                  tracking-tight
                  text-white
                  lg:text-5xl
                "
              >
                PecuariaTech
              </h1>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-bold
                  text-emerald-100
                  lg:text-3xl
                "
              >
                Dashboard Executivo
              </h2>

              <p
                className="
                  mt-4
                  max-w-3xl
                  text-base
                  leading-relaxed
                  text-emerald-50/75
                  lg:text-lg
                "
              >

                <T
                  pt="Plataforma operacional analítica para gestão inteligente, financeira e estratégica da operação pecuária."
                  es="Plataforma operacional analítica para gestión inteligente, financiera y estratégica de la operación ganadera."
                />

              </p>

            </div>

            {/* KPI GRID */}

            <div
              className="
                mt-8
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {[
                {
                  labelPt:
                    "EBITDA",

                  labelEs:
                    "EBITDA",

                  value:
                    "R$ 1.240.000",

                  hintPt:
                    "↑ 12.4% nos últimos 30 dias",

                  hintEs:
                    "↑ 12.4% en los últimos 30 días",
                },

                {
                  labelPt:
                    "Margem Operacional",

                  labelEs:
                    "Margen Operacional",

                  value:
                    "18.2%",

                  hintPt:
                    "↑ crescimento consistente",

                  hintEs:
                    "↑ crecimiento consistente",
                },

                {
                  labelPt:
                    "Custo Alimentar",

                  labelEs:
                    "Costo Alimentario",

                  value:
                    "R$ 482.000",

                  hintPt:
                    "↓ redução de 4.1%",

                  hintEs:
                    "↓ reducción de 4.1%",
                },
              ].map((item) => (

                <div
                  key={item.labelPt}
                  className="
                    rounded-[24px]
                    border
                    border-white/10
                    bg-black/25
                    p-5
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:border-emerald-400/20
                    hover:bg-black/30
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span
                      className="
                        text-sm
                        font-medium
                        text-emerald-100/60
                      "
                    >

                      <T
                        pt={item.labelPt}
                        es={item.labelEs}
                      />

                    </span>

                    <div
                      className="
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-green-400
                      "
                    />

                  </div>

                  <div
                    className="
                      mt-4
                      text-3xl
                      font-black
                      tracking-tight
                      text-white
                    "
                  >
                    {item.value}
                  </div>

                  <div
                    className="
                      mt-2
                      text-sm
                      text-emerald-300
                    "
                  >

                    <T
                      pt={item.hintPt}
                      es={item.hintEs}
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>

        {/* =====================================================
            PERFORMANCE
        ===================================================== */}

        <section className="-mt-2">

          <ExecutiveChart />

        </section>

        {/* =====================================================
            CFO
        ===================================================== */}

        <section className="-mt-4 space-y-6">

          <div
            className="
              flex
              flex-col
              gap-4
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <h2
                className="
                  text-4xl
                  font-black
                  tracking-tight
                  text-[#07130d]
                "
              >

                <T
                  pt="Inteligência Financeira"
                  es="Inteligencia Financiera"
                />

              </h2>

              <p
                className="
                  mt-2
                  text-lg
                  text-gray-600
                "
              >

                <T
                  pt="Análise operacional consolidada da fazenda"
                  es="Análisis operacional consolidado de la finca"
                />

              </p>

            </div>

            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-emerald-200
                bg-white
                px-5
                py-3
                text-sm
                font-bold
                text-emerald-700
                shadow-lg
              "
            >

              <div
                className="
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-green-500
                  animate-pulse
                "
              />

              <T
                pt="CFO Online"
                es="CFO Online"
              />

            </div>

          </div>

          <div className="space-y-6">

            <CFORealCard />

            <CFOAIInsights />

          </div>

        </section>

        {/* =====================================================
            MÓDULOS
        ===================================================== */}

        <section className="-mt-2 space-y-6">

          <div>

            <h2
              className="
                text-4xl
                font-black
                tracking-tight
                text-[#07130d]
              "
            >

              <T
                pt="Módulos Estratégicos"
                es="Módulos Estratégicos"
              />

            </h2>

            <p
              className="
                mt-2
                text-lg
                text-gray-600
              "
            >

              <T
                pt="Núcleos operacionais integrados do sistema executivo rural"
                es="Núcleos operacionales integrados del sistema ejecutivo rural"
              />

            </p>

          </div>

          <div
            className="
              grid
              gap-6
              md:grid-cols-2
              xl:grid-cols-4
            "
          >

            {modules.map((mod) => (

              <div
                key={mod.titlePt}
                className={`
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-white/40
                  bg-gradient-to-br
                  ${mod.glow}
                  bg-[#08150f]
                  p-6
                  shadow-[0_0_30px_rgba(0,0,0,0.08)]
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]
                `}
              >

                <div
                  className="
                    absolute
                    right-[-40px]
                    top-[-40px]
                    h-40
                    w-40
                    rounded-full
                    bg-white/5
                    blur-3xl
                  "
                />

                <div className="relative z-10">

                  <div className="text-4xl">
                    {mod.icon}
                  </div>

                  <h3
                    className="
                      mt-5
                      text-2xl
                      font-black
                      leading-tight
                      text-white
                    "
                  >

                    <T
                      pt={mod.titlePt}
                      es={mod.titleEs}
                    />

                  </h3>

                  <p
                    className="
                      mt-4
                      text-base
                      leading-8
                      text-emerald-50/75
                    "
                  >

                    <T
                      pt={mod.descPt}
                      es={mod.descEs}
                    />

                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

    </main>
  );
}