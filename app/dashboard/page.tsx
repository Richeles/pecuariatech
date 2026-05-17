"use client";

import T from "@/app/components/T";

import CFORealCard
  from "@/app/components/cfo/CFORealCard";

import CFOAIInsights
  from "@/app/components/cfo/CFOAIInsights";

/* =========================================================
   DASHBOARD HOME
   PecuariaTech Runtime Enterprise
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
    },

    {
      titlePt:
        "CFO Cognitivo",

      titleEs:
        "CFO Cognitivo",

      descPt:
        "Diagnóstico financeiro automatizado por inteligência operacional.",

      descEs:
        "Diagnóstico financiero automatizado por inteligencia operacional.",

      icon: "🧠",
    },
  ];

  return (

    <main className="min-h-screen text-white">

      {/* =====================================================
          WRAPPER
      ===================================================== */}

      <div className="mx-auto max-w-[1850px] space-y-14">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[36px]
            border
            border-emerald-900/40
            bg-gradient-to-br
            from-[#02150d]
            via-[#031b11]
            to-[#021008]
            p-10
            shadow-2xl
          "
        >

          {/* GLOW */}

          <div
            className="
              absolute
              -top-24
              right-0
              h-[320px]
              w-[320px]
              rounded-full
              bg-emerald-500/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              z-10
            "
          >

            {/* BADGE */}

            <div
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-emerald-500/20
                bg-emerald-500/10
                px-5
                py-2
                text-sm
                font-semibold
                text-emerald-300
              "
            >

              <T
                pt="IA operacional estabilizada"
                es="IA operacional estabilizada"
              />

            </div>

            {/* TITLE */}

            <h1
              className="
                mt-7
                text-5xl
                font-black
                tracking-tight
                text-white
                xl:text-6xl
              "
            >
              PecuariaTech
            </h1>

            <p
              className="
                mt-6
                max-w-4xl
                text-lg
                leading-9
                text-emerald-100/70
              "
            >

              <T
                pt="Plataforma operacional analítica para gestão inteligente, financeira e estratégica da operação pecuária."
                es="Plataforma operacional analítica para gestión inteligente, financiera y estratégica de la operación ganadera."
              />

            </p>

            {/* KPI GRID */}

            <div
              className="
                mt-14
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {[
                {
                  labelPt:
                    "Animais rastreados",

                  labelEs:
                    "Animales rastreados",

                  value: "1.247",

                  hintPt:
                    "Base operacional consolidada",

                  hintEs:
                    "Base operacional consolidada",
                },

                {
                  labelPt:
                    "Receita operacional",

                  labelEs:
                    "Ingresos operacionales",

                  value: "R$ 124.580",

                  hintPt:
                    "Resultado consolidado mensal",

                  hintEs:
                    "Resultado consolidado mensual",
                },

                {
                  labelPt:
                    "Eficiência produtiva",

                  labelEs:
                    "Eficiencia productiva",

                  value: "87%",

                  hintPt:
                    "Índice médio operacional",

                  hintEs:
                    "Índice operacional promedio",
                },
              ].map((item) => (

                <div
                  key={item.labelPt}
                  className="
                    rounded-3xl
                    border
                    border-emerald-500/20
                    bg-[#0a2117]/90
                    p-8
                    shadow-xl
                    backdrop-blur
                  "
                >

                  <div
                    className="
                      text-sm
                      text-emerald-100/50
                    "
                  >

                    <T
                      pt={item.labelPt}
                      es={item.labelEs}
                    />

                  </div>

                  <div
                    className="
                      mt-4
                      text-5xl
                      font-black
                      tracking-tight
                      text-white
                    "
                  >
                    {item.value}
                  </div>

                  <div
                    className="
                      mt-3
                      text-sm
                      text-emerald-100/50
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
            CFO
        ===================================================== */}

        <section className="space-y-6">

          <div
            className="
              flex
              flex-col
              gap-5
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
                  text-gray-950
                "
              >

                <T
                  pt="Inteligência Financeira"
                  es="Inteligencia Financiera"
                />

              </h2>

              <p
                className="
                  mt-3
                  text-lg
                  text-gray-500
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
                rounded-full
                border
                border-emerald-200
                bg-emerald-50
                px-5
                py-3
                text-sm
                font-bold
                text-emerald-700
              "
            >

              <T
                pt="CFO Online"
                es="CFO Online"
              />

            </div>

          </div>

          {/* =================================================
              CFO REAL + IA
          ================================================= */}

          <div className="space-y-8">

            <CFORealCard />

            <CFOAIInsights />

          </div>

        </section>

        {/* =====================================================
            MODULOS
        ===================================================== */}

        <section className="space-y-8">

          <div>

            <h2
              className="
                text-4xl
                font-black
                text-gray-950
              "
            >

              <T
                pt="Módulos Estratégicos"
                es="Módulos Estratégicos"
              />

            </h2>

            <p
              className="
                mt-3
                text-lg
                text-gray-500
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
              gap-7
              md:grid-cols-2
              xl:grid-cols-4
            "
          >

            {modules.map((mod) => (

              <div
                key={mod.titlePt}
                className="
                  rounded-[30px]
                  border
                  border-emerald-100
                  bg-white
                  p-8
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-2xl
                "
              >

                <div className="text-4xl">
                  {mod.icon}
                </div>

                <h3
                  className="
                    mt-6
                    text-2xl
                    font-black
                    text-gray-950
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
                    leading-8
                    text-gray-600
                  "
                >

                  <T
                    pt={mod.descPt}
                    es={mod.descEs}
                  />

                </p>

              </div>

            ))}

          </div>

        </section>

        {/* =====================================================
            STATUS
        ===================================================== */}

        <section
          className="
            rounded-[36px]
            border
            border-emerald-100
            bg-gradient-to-r
            from-[#052818]
            to-[#031b11]
            p-10
            shadow-2xl
          "
        >

          <div
            className="
              flex
              flex-col
              gap-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <div
                className="
                  text-sm
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-emerald-300
                "
              >

                <T
                  pt="Sistema Operacional"
                  es="Sistema Operacional"
                />

              </div>

              <h3
                className="
                  mt-4
                  text-4xl
                  font-black
                  text-white
                "
              >

                <T
                  pt="Plataforma estabilizada"
                  es="Plataforma estabilizada"
                />

              </h3>

              <p
                className="
                  mt-5
                  max-w-3xl
                  text-lg
                  leading-9
                  text-emerald-100/70
                "
              >

                <T
                  pt="Todos os módulos operacionais estão sincronizados, protegidos e funcionando dentro da arquitetura analítica integrada."
                  es="Todos los módulos operacionales están sincronizados, protegidos y funcionando dentro de la arquitectura analítica integrada."
                />

              </p>

            </div>

            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-2xl
                border
                border-emerald-500/20
                bg-[#0b1811]/70
                px-7
                py-5
                text-lg
                font-semibold
                text-emerald-300
              "
            >

              <div
                className="
                  h-3
                  w-3
                  rounded-full
                  bg-green-400
                "
              />

              <T
                pt="Operação online"
                es="Operación online"
              />

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}