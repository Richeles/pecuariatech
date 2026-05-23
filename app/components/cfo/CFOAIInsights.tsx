"use client";

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
        border-emerald-900/40
        bg-[#163328]
        p-6
        xl:p-7
        shadow-[0_0_50px_rgba(0,0,0,0.40)]
      "
    >

      {/* FX */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-[#2A6D4A]/35
          via-[#163328]/40
          to-[#3B8B5E]/20
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
                border-[#2F6B52]
                bg-[#2A6D4A]/70
                px-4
                py-2.5
                text-[11px]
                font-black
                uppercase
                tracking-[0.22em]
                text-emerald-200
              "
            >

              <div
                className="
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-[#86EFAC]
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
                text-zinc-200
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
              border-[#2F6B52]
              bg-[#2A6D4A]/70
              px-5
              py-3
              text-xs
              font-black
              uppercase
              tracking-[0.15em]
              text-emerald-200
            "
          >

            <div
              className="
                h-2.5
                w-2.5
                rounded-full
                bg-[#86EFAC]
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
            color="text-[#86EFAC]"
          />

          <KpiCard
            title="Pressão Caixa"
            value="R$ 4.820"
            color="text-amber-200"
          />

          <KpiCard
            title="Conversão Operacional"
            value="R$ 7.580"
            color="text-cyan-200"
          />

          <KpiCard
            title="Risco Estrutural"
            value="MÉDIO"
            color="text-lime-200"
          />

        </div>

        {/* ADVISORY */}

        <div
          className="
            mt-8
            rounded-[26px]
            border
            border-[#2F6B52]/40
            bg-[#1F4737]/75
            p-6
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
        border-[#2F6B52]/40
        bg-[#1F4737]/75
        p-5
        flex
        flex-col
        justify-between
      "
    >

      <div
        className="
          text-[11px]
          uppercase
          tracking-[0.20em]
          text-zinc-300
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
        border-[#2F6B52]/40
        bg-[#1A3D30]/80
        px-5
        py-4
      "
    >

      <div
        className="
          h-2.5
          w-2.5
          rounded-full
          bg-[#86EFAC]
        "
      />

      <p
        className="
          text-sm
          leading-6
          text-zinc-200
        "
      >
        {text}
      </p>

    </div>
  );
}