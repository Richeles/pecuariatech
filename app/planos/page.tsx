// app/planos/page.tsx

import PlanosClient from "./PlanosClient";

export default function PlanosPage() {

  return (

    <main
      className="
        min-h-screen
        bg-gradient-to-b
        from-[#f7faf7]
        via-white
        to-white
      "
    >

      {/* =====================================
          HERO PREMIUM
      ===================================== */}

      <section
        className="
          relative
          overflow-hidden
          border-b
          border-neutral-100
        "
      >

        {/* =====================================
            BG GLOW
        ===================================== */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.10),transparent_45%)]
          "
        />

        {/* =====================================
            HERO CONTENT
        ===================================== */}

        <div
          className="
            relative
            mx-auto
            max-w-6xl
            px-4
            pb-6
            pt-10
            text-center
            md:px-6
            md:pb-10
            md:pt-16
          "
        >

          {/* =====================================
              BADGE
          ===================================== */}

          <div
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-green-200
              bg-green-50
              px-5
              py-2
              text-[11px]
              font-black
              uppercase
              tracking-widest
              text-green-700
              shadow-sm
            "
          >
            PecuariaTech Intelligence Layer
          </div>

          {/* =====================================
              TITLE
          ===================================== */}

          <h1
            className="
              mx-auto
              mt-6
              max-w-5xl
              text-4xl
              font-black
              leading-tight
              tracking-tight
              text-neutral-950
              md:mt-8
              md:text-7xl
            "
          >
            Planos PecuariaTech
          </h1>

          {/* =====================================
              SUBTITLE
          ===================================== */}

          <p
            className="
              mx-auto
              mt-6
              max-w-4xl
              text-base
              leading-8
              text-neutral-600
              md:mt-8
              md:text-2xl
              md:leading-10
            "
          >
            Cada plano foi pensado para uma realidade
            diferente no campo — do controle básico
            à gestão com IA operacional, CFO Autônomo
            e inteligência estratégica integrada.
          </p>

          {/* =====================================
              TRUST BLOCKS
          ===================================== */}

          <div
            className="
              mx-auto
              mt-8
              grid
              max-w-5xl
              grid-cols-2
              gap-3
              md:grid-cols-4
              md:gap-4
            "
          >

            {[
              "IA Operacional",
              "CFO Ultra",
              "Cloud Runtime",
              "Visão 360°",
            ].map((item) => (

              <div
                key={item}
                className="
                  rounded-2xl
                  border
                  border-neutral-200
                  bg-white/80
                  px-4
                  py-4
                  text-sm
                  font-bold
                  text-neutral-800
                  shadow-sm
                  backdrop-blur
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >
                {item}
              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================
          CLIENT
      ===================================== */}

      <section
        className="
          relative
          mx-auto
          max-w-[1700px]
          px-4
          py-6
          md:py-8
        "
      >
        <PlanosClient />
      </section>

    </main>
  );
}