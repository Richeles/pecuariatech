"use client";

type Props = {
  score?: number;
  risco?: string;
  compliance?: number;
  decisao?: string;
};

export default function CentroCognitivoRebanho({
  score = 91,
  risco = "BAIXO",
  compliance = 96,
  decisao = "Operação estabilizada",
}: Props) {

  const riscoColor =
    risco === "ALTO"
      ? "text-red-600"
      : risco === "MODERADO"
      ? "text-amber-500"
      : "text-emerald-600";

  return (

    <section
      className="
        rounded-[36px]
        border
        border-emerald-100
        bg-white
        p-8
        shadow-sm
      "
    >

      {/* HEADER */}

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

          <div
            className="
              inline-flex
              rounded-full
              border
              border-emerald-200
              bg-emerald-50
              px-4
              py-2
              text-xs
              font-black
              tracking-[0.2em]
              text-emerald-700
            "
          >
            CENTRO COGNITIVO BIOLOGICO
          </div>

          <h2
            className="
              mt-2
              text-4xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Governança Cognitiva Rebanho
          </h2>

          <p
            className="
              mt-3
              max-w-3xl
              text-slate-600
              leading-relaxed
            "
          >
            Runtime cognitivo conectado ao motor biológico,
            brincos inteligentes, pressão animal,
            sanidade operacional e rastreabilidade contínua.
          </p>

        </div>

        <div
          className="
            rounded-full
            bg-emerald-600
            px-6
            py-3
            text-sm
            font-black
            tracking-[0.2em]
            text-white
          "
        >
          ONLINE
        </div>

      </div>

      {/* GRID */}

      <div
        className="
          mt-8
          grid
          gap-5
          lg:grid-cols-4
        "
      >

        {/* SCORE */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-100
            bg-emerald-50
            p-6
          "
        >

          <p className="text-sm text-slate-500">
            Score Biológico
          </p>

          <div
            className="
              mt-2
              text-5xl
              font-black
              text-emerald-700
            "
          >
            {score}
          </div>

        </div>

        {/* RISCO */}

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
          "
        >

          <p className="text-sm text-slate-500">
            Risco Operacional
          </p>

          <div
            className={`
              mt-2
              text-3xl
              font-black
              ${riscoColor}
            `}
          >
            {risco}
          </div>

        </div>

        {/* COMPLIANCE */}

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
          "
        >

          <p className="text-sm text-slate-500">
            Compliance Sanitário
          </p>

          <div
            className="
              mt-2
              text-4xl
              font-black
              text-slate-900
            "
          >
            {compliance}%
          </div>

        </div>

        {/* DECISÃO */}

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
          "
        >

          <p className="text-sm text-slate-500">
            Decisão Recomendada
          </p>

          <div
            className="
              mt-2
              text-lg
              font-bold
              text-slate-900
            "
          >
            {decisao}
          </div>

        </div>

      </div>

      {/* GOVERNANÇA */}

      <div
        className="
          mt-8
          rounded-3xl
          border
          border-slate-100
          bg-slate-50
          p-6
        "
      >

        <div
          className="
            text-sm
            font-black
            tracking-[0.2em]
            text-slate-500
          "
        >
          ENGINES COGNITIVAS ATIVAS
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
            "BRINCOS IOT",
            "SANIDADE AI",
            "PRESSÃO ANIMAL",
            "GMD ENGINE",
            "PESO EVOLUTIVO",
            "COMPLIANCE AI",
            "TRACEABILITY",
            "RUNTIME PYTHON",
          ].map((item) => (

            <div
              key={item}
              className="
                rounded-full
                border
                border-emerald-200
                bg-white
                px-4
                py-2
                text-xs
                font-black
                tracking-[0.15em]
                text-emerald-700
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