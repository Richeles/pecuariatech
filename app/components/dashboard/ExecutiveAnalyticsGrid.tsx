"use client";

/* =========================================================
   EXECUTIVE ANALYTICS GRID
   PecuariaTech Executive Runtime
   ULTRA PREMIUM BIOLOGICAL
========================================================= */

const analytics = [

  {
    title: "ESG SCORE",
    value: "94%",
    status: "Excelente",
    glow: "from-emerald-500/20 to-green-500/5",
    text: "text-emerald-400",
    icon: "🌎",
  },

  {
    title: "RISCO OPERACIONAL",
    value: "BAIXO",
    status: "Controlado",
    glow: "from-cyan-500/20 to-emerald-500/5",
    text: "text-cyan-400",
    icon: "🛡️",
  },

  {
    title: "EFICIÊNCIA ALIMENTAR",
    value: "87%",
    status: "Alta performance",
    glow: "from-lime-500/20 to-green-500/5",
    text: "text-lime-400",
    icon: "🌱",
  },

  {
    title: "SANIDADE",
    value: "92%",
    status: "Estável",
    glow: "from-violet-500/20 to-fuchsia-500/5",
    text: "text-fuchsia-400",
    icon: "💉",
  },

  {
    title: "PRESSÃO CLIMÁTICA",
    value: "MODERADA",
    status: "Monitorada",
    glow: "from-orange-500/20 to-yellow-500/5",
    text: "text-orange-400",
    icon: "🌤️",
  },

  {
    title: "SCORE π",
    value: "96",
    status: "Ultra Runtime",
    glow: "from-emerald-500/20 to-teal-500/5",
    text: "text-teal-400",
    icon: "🧠",
  },

];

/* =========================================================
   COMPONENT
========================================================= */

export default function ExecutiveAnalyticsGrid() {

  return (

    <section
      className="
        grid
        gap-7
        md:grid-cols-2
        xl:grid-cols-3
      "
    >

      {analytics.map((item) => (

        <div
          key={item.title}
          className={`
            relative
            overflow-hidden
            rounded-[34px]
            border
            border-white/10
            bg-gradient-to-br
            ${item.glow}
            bg-[#07150f]
            p-8
            shadow-[0_0_40px_rgba(0,0,0,0.18)]
            backdrop-blur-xl
            transition-all
            duration-500
            hover:-translate-y-2
            hover:shadow-[0_0_60px_rgba(16,185,129,0.14)]
          `}
        >

          {/* GLOW FX */}

          <div
            className="
              absolute
              right-[-60px]
              top-[-60px]
              h-40
              w-40
              rounded-full
              bg-white/5
              blur-3xl
            "
          />

          {/* GRID FX */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.03]
              bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)]
              bg-[size:60px_60px]
            "
          />

          <div className="relative z-10">

            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  text-sm
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-white/60
                "
              >
                {item.title}
              </div>

              <div className="text-4xl">
                {item.icon}
              </div>

            </div>

            {/* VALUE */}

            <div
              className={`
                mt-10
                text-5xl
                font-black
                tracking-tight
                ${item.text}
              `}
            >
              {item.value}
            </div>

            {/* STATUS */}

            <div
              className="
                mt-6
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-white/10
                bg-white/5
                px-5
                py-3
                text-sm
                font-bold
                text-white/80
                backdrop-blur-xl
              "
            >

              <div
                className="
                  h-3
                  w-3
                  rounded-full
                  bg-green-400
                  animate-pulse
                "
              />

              {item.status}

            </div>

            {/* DESCRIPTION */}

            <p
              className="
                mt-8
                text-lg
                leading-8
                text-white/60
              "
            >
              Runtime cognitivo monitorando continuamente os indicadores operacionais da fazenda.
            </p>

          </div>

        </div>

      ))}

    </section>
  );
}