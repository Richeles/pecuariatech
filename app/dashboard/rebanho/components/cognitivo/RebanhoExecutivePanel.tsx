"use client";

export default function RebanhoExecutivePanel() {

  return (

    <section
      className="
        rounded-[36px]
        border
        border-slate-200
        bg-[#07111f]
        p-8
        text-white
        shadow-2xl
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <div
            className="
              text-xs
              font-black
              tracking-[0.3em]
              text-emerald-400
            "
          >
            EXECUTIVE COGNITIVE PANEL
          </div>

          <h2
            className="
              mt-3
              text-4xl
              font-black
            "
          >
            Rebanho Intelligence
          </h2>

          <p
            className="
              mt-3
              max-w-3xl
              text-slate-400
            "
          >
            Leitura estrutural do rebanho em tempo real,
            integrando sanidade, peso, GMD,
            pressão operacional e compliance.
          </p>

        </div>

        <div
          className="
            rounded-full
            bg-emerald-500/20
            px-5
            py-3
            text-sm
            font-black
            tracking-[0.2em]
            text-emerald-400
          "
        >
          RUNTIME ONLINE
        </div>

      </div>

      {/* GRID */}

      <div
        className="
          mt-10
          grid
          gap-6
          lg:grid-cols-4
        "
      >

        {/* SCORE */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-500/20
            bg-gradient-to-br
            from-emerald-500/10
            to-transparent
            p-6
          "
        >

          <div className="text-slate-400">
            Score Biológico
          </div>

          <div
            className="
              mt-3
              text-6xl
              font-black
              text-emerald-400
            "
          >
            91
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Estrutura preservada
          </div>

        </div>

        {/* PRESSÃO */}

        <div
          className="
            rounded-3xl
            border
            border-red-500/20
            bg-gradient-to-br
            from-red-500/10
            to-transparent
            p-6
          "
        >

          <div className="text-slate-400">
            Pressão Operacional
          </div>

          <div
            className="
              mt-3
              text-5xl
              font-black
              text-red-400
            "
          >
            0.88
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Tendência moderada
          </div>

        </div>

        {/* COMPLIANCE */}

        <div
          className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-gradient-to-br
            from-cyan-500/10
            to-transparent
            p-6
          "
        >

          <div className="text-slate-400">
            Compliance
          </div>

          <div
            className="
              mt-3
              text-5xl
              font-black
              text-cyan-400
            "
          >
            96%
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Governança sanitária
          </div>

        </div>

        {/* GMD */}

        <div
          className="
            rounded-3xl
            border
            border-amber-500/20
            bg-gradient-to-br
            from-amber-500/10
            to-transparent
            p-6
          "
        >

          <div className="text-slate-400">
            GMD
          </div>

          <div
            className="
              mt-3
              text-5xl
              font-black
              text-amber-300
            "
          >
            0.52
          </div>

          <div className="mt-2 text-sm text-slate-400">
            kg/dia
          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div
        className="
          mt-8
          rounded-3xl
          border
          border-slate-700
          bg-[#0d1726]
          p-6
        "
      >

        <div
          className="
            text-xs
            font-black
            tracking-[0.25em]
            text-slate-500
          "
        >
          ENGINES OPERACIONAIS
        </div>

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-3
          "
        >

          {[
            "TRACEABILITY AI",
            "PRESSURE ENGINE",
            "SANIDADE AI",
            "IOT BRINCOS",
            "GMD ENGINE",
            "THERMAL AI",
            "COMPLIANCE AI",
            "RUNTIME PYTHON",
          ].map((item) => (

            <div
              key={item}
              className="
                rounded-full
                border
                border-slate-700
                bg-slate-900
                px-4
                py-2
                text-xs
                font-black
                tracking-[0.15em]
                text-slate-300
              "
            >
              {item}
            </div>

          ))}

        </div>

      </div>

    </section>
  );
}