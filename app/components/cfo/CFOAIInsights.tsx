"use client";

// CAMINHO: app/components/cfo/CFOAIInsights.tsx
// PecuariaTech
// CFO Runtime Agro Premium Biológico
// Verde Grama Tecnológico
// Next.js 16 + TypeScript strict

import T from "@/app/components/T";

export default function CFOAIInsights() {

  return (

    <section
      className="
        relative
        w-full
        overflow-hidden
        rounded-[32px]
        border
        border-[#D8F3DC]/10
        bg-[#4D9A6D]
        p-6
        xl:p-7
        shadow-[0_0_60px_rgba(34,197,94,0.22)]
      "
    >

      {/* FX */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-[#BBF7D0]/20
          via-transparent
          to-[#95D5B2]/20
        "
      />

      {/* CONTENT */}

      <div className="relative z-10">

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-5
            xl:flex-row
            xl:items-start
            xl:justify-between
          "
        >

          <div className="max-w-3xl">

            {/* BADGE */}

            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-[#DCFCE7]/20
                bg-[#BBF7D0]/25
                px-4
                py-2.5
                text-[11px]
                font-black
                uppercase
                tracking-[0.22em]
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

              <T
                pt="Runtime Cognitivo Online"
                es="Runtime Cognitivo Online"
              />

            </div>

            {/* TITLE */}

            <h2
              className="
                mt-6
                text-4xl
                font-black
                leading-[1.05]
                text-white
                xl:text-5xl
              "
            >

              <T
                pt="CFO Cognitivo Estrutural"
                es="CFO Cognitivo Estructural"
              />

            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                mt-5
                max-w-2xl
                text-base
                leading-7
                text-[#F0FFF4]
              "
            >

              <T
                pt="Leitura contínua da sustentação financeira e conversão estrutural da operação pecuária."
                es="Lectura continua de la sustentación financiera y conversión estructural de la operación ganadera."
              />

            </p>

          </div>

          {/* STATUS */}

          <div
            className="
              inline-flex
              items-center
              gap-3
              self-start
              rounded-2xl
              border
              border-[#DCFCE7]/20
              bg-[#BBF7D0]/25
              px-5
              py-3
              text-xs
              font-black
              uppercase
              tracking-[0.15em]
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
              "
            />

            CFO_RUNTIME_AI

          </div>

        </div>

        {/* KPI GRID */}

        <div
          className="
            mt-8
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >

          <KpiCard
            title="Receita Estrutural"
            value="R$ 0"
            color="text-[#F0FFF4]"
          />

          <KpiCard
            title="Pressão Caixa"
            value="R$ 4.820"
            color="text-amber-100"
          />

          <KpiCard
            title="Conversão Operacional"
            value="R$ 7.580"
            color="text-cyan-100"
          />

          <KpiCard
            title="Risco Estrutural"
            value="MÉDIO"
            color="text-lime-100"
          />

        </div>

        {/* ADVISORY */}

        <div
          className="
            mt-8
            rounded-[26px]
            border
            border-[#D8F3DC]/10
            bg-[#74C69D]/25
            p-6
            backdrop-blur-xl
          "
        >

          <h3
            className="
              text-2xl
              font-black
              text-white
            "
          >

            <T
              pt="Advisory Estrutural"
              es="Advisory Estructural"
            />

          </h3>

          <div className="mt-5 space-y-3">

            <AdvisoryItem
              text="Monitorar pressão estrutural."
            />

            <AdvisoryItem
              text="Reavaliar sincronismo operacional."
            />

            <AdvisoryItem
              text="Ajustar eficiência de conversão."
            />

          </div>

        </div>

      </div>

    </section>
  );
}

/* ===================================================== */
/* KPI CARD */
/* ===================================================== */

function KpiCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {

  return (

    <div
      className="
        min-h-[150px]
        rounded-[24px]
        border
        border-[#D8F3DC]/10
        bg-gradient-to-br
        from-[#74C69D]
        via-[#95D5B2]
        to-[#5FB981]
        p-5
        flex
        flex-col
        justify-between
        shadow-[0_0_35px_rgba(34,197,94,0.14)]
      "
    >

      <div
        className="
          text-[11px]
          uppercase
          tracking-[0.20em]
          text-[#ECFDF5]
        "
      >
        {title}
      </div>

      <div
        className={`
          whitespace-nowrap
          text-3xl
          font-black
          leading-none
          xl:text-4xl
          ${color}
        `}
      >
        {value}
      </div>

    </div>
  );
}

/* ===================================================== */
/* ADVISORY */
/* ===================================================== */

function AdvisoryItem({
  text,
}: {
  text: string;
}) {

  return (

    <div
      className="
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-[#D8F3DC]/10
        bg-[#95D5B2]/20
        px-5
        py-4
        backdrop-blur-xl
      "
    >

      <div
        className="
          h-2.5
          w-2.5
          rounded-full
          bg-[#DCFCE7]
        "
      />

      <p
        className="
          text-sm
          leading-6
          text-[#F0FFF4]
        "
      >
        {text}
      </p>

    </div>
  );
}
