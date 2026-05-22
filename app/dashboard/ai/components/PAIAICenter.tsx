"use client";

/* =========================================================
   PECUARIATECH
   PAI AI CENTER
   STABLE ENTERPRISE RUNTIME
   TRIÂNGULO 360
   EQUAÇÃO Y + EQUAÇÃO Z
========================================================= */

export default function PAIAICenter() {

  const runtimeStatus = [
    {
      title: "Governança",
      value: "ATIVA",
    },
    {
      title: "Equação Y",
      value: "ONLINE",
    },
    {
      title: "Equação Z",
      value: "OPERACIONAL",
    },
    {
      title: "Triângulo 360",
      value: "ESTÁVEL",
    },
  ];

  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-emerald-500/10
        bg-gradient-to-br
        from-[#03150d]
        via-[#062317]
        to-[#0b2e1f]
        p-8
        xl:p-10
        shadow-[0_0_80px_rgba(16,185,129,0.10)]
      "
    >

      {/* BACKGROUND FX */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.03]
          bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)]
          bg-[size:70px_70px]
        "
      />

      <div
        className="
          absolute
          right-[-120px]
          top-[-120px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-emerald-400/10
          blur-3xl
        "
      />

      <div className="relative z-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            flex-wrap
            items-start
            justify-between
            gap-8
          "
        >

          {/* LEFT */}

          <div className="max-w-4xl">

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
                py-2.5
                text-xs
                font-black
                uppercase
                tracking-[0.22em]
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

              PAI AI ONLINE

            </div>

            <h2
              className="
                mt-7
                text-4xl
                font-black
                tracking-tight
                text-white
                lg:text-5xl
              "
            >
              PAI AI Center
            </h2>

            <p
              className="
                mt-5
                max-w-3xl
                text-lg
                leading-relaxed
                text-emerald-50/75
              "
            >
              Núcleo cognitivo executivo integrado ao runtime
              biológico, financeiro, operacional e analítico
              da PecuariaTech.
            </p>

          </div>

          {/* RIGHT */}

          <div
            className="
              rounded-[26px]
              border
              border-white/10
              bg-black/20
              px-7
              py-6
              backdrop-blur-xl
              min-w-[220px]
            "
          >

            <div
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.20em]
                text-emerald-300
              "
            >
              STATUS EXECUTIVO
            </div>

            <div
              className="
                mt-4
                text-4xl
                font-black
                text-white
              "
            >
              ONLINE
            </div>

            <div
              className="
                mt-3
                text-sm
                text-emerald-100/70
              "
            >
              Runtime cognitivo estabilizado
            </div>

          </div>

        </div>

        {/* =====================================================
            GRID
        ===================================================== */}

        <div
          className="
            mt-10
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-4
          "
        >

          {runtimeStatus.map((item) => (

            <div
              key={item.title}
              className="
                rounded-[24px]
                border
                border-white/10
                bg-black/20
                p-6
                backdrop-blur-xl
                transition-all
                duration-300
                hover:border-emerald-400/20
                hover:bg-black/30
              "
            >

              <div
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-emerald-200/70
                "
              >
                {item.title}
              </div>

              <div
                className="
                  mt-4
                  text-2xl
                  font-black
                  text-white
                "
              >
                {item.value}
              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}