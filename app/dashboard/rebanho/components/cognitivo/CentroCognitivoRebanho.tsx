"use client";

type Diagnostico = {
  score_biologico?: number;
  risco?: string;
  compliance?: number;
  pressao?: number;
  temperatura?: number;
  sanidade?: number;
};

type Props = {
  diagnostico?: Diagnostico;
  advisory?: string[];
  decisao?: string;
};

export default function CentroCognitivoRebanho({
  diagnostico,
  advisory = [],
  decisao,
}: Props) {

  const score =
    diagnostico?.score_biologico ?? 0;

  const risco =
    diagnostico?.risco ?? "BAIXO";

  const compliance =
    diagnostico?.compliance ?? 0;

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

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          flex-wrap
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
              text-[11px]
              font-black
              tracking-[0.25em]
              text-emerald-700
            "
          >
            CENTRO COGNITIVO BIOLÓGICO
          </div>

          <h2
            className="
              mt-4
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
              mt-4
              max-w-4xl
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
            bg-emerald-500
            px-6
            py-3
            text-xs
            font-black
            tracking-[0.25em]
            text-white
          "
        >
          ONLINE
        </div>

      </div>

      <div
        className="
          mt-8
          grid
          gap-4
          md:grid-cols-4
        "
      >

        <Card
          title="Score Biológico"
          value={String(score)}
        />

        <Card
          title="Risco Operacional"
          value={risco}
        />

        <Card
          title="Compliance Sanitário"
          value={`${compliance}%`}
        />

        <Card
          title="Decisão Recomendada"
          value={decisao || "Sem decisão"}
        />

      </div>

      <div
        className="
          mt-8
          rounded-[28px]
          border
          border-slate-100
          bg-slate-50
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
          ENGINES COGNITIVAS ATIVAS
        </div>

        <div
          className="
            mt-5
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
                tracking-[0.2em]
                text-emerald-700
              "
            >
              {item}
            </div>

          ))}

        </div>

      </div>

      {!!advisory.length && (

        <div
          className="
            mt-8
            grid
            gap-4
            md:grid-cols-2
          "
        >

          {advisory.map((item) => (

            <div
              key={item}
              className="
                rounded-2xl
                border
                border-amber-200
                bg-amber-50
                p-4
                text-sm
                font-semibold
                text-amber-900
              "
            >
              {item}
            </div>

          ))}

        </div>

      )}

    </section>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (

    <div
      className="
        rounded-[24px]
        border
        border-slate-200
        bg-white
        p-6
      "
    >

      <div
        className="
          text-sm
          text-slate-500
        "
      >
        {title}
      </div>

      <div
        className="
          mt-3
          text-5xl
          font-black
          text-slate-900
        "
      >
        {value}
      </div>

    </div>
  );
}