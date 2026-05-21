"use client";

type Props = {
  diagnostico?: {
    gmd?: number;
    conversao?: number;
    eficiencia?: number;
    risco?: string;
    temperatura?: number;
    consumo?: number;
  };

  advisory?: string[];

  decisao?: string;
};

export default function CentroCognitivoEngorda({
  diagnostico,
  advisory = [],
  decisao,
}: Props) {

  const gmd =
    diagnostico?.gmd ?? 1.78;

  const conversao =
    diagnostico?.conversao ?? 5.8;

  const eficiencia =
    diagnostico?.eficiencia ?? 94;

  const risco =
    diagnostico?.risco ?? "MODERADO";

  return (

    <section
      className="
        rounded-[42px]
        border
        border-emerald-100
        bg-white/95
        p-8
        shadow-sm
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-6
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
              px-5
              py-2
              text-[11px]
              font-black
              tracking-[0.3em]
              text-emerald-700
            "
          >
            ENGORDA COGNITIVE ENGINE
          </div>

          <h2
            className="
              mt-5
              text-5xl
              font-black
              tracking-tight
              text-slate-950
            "
          >
            Governança Cognitiva da Engorda
          </h2>

          <p
            className="
              mt-5
              max-w-4xl
              text-lg
              leading-relaxed
              text-slate-600
            "
          >
            Plataforma cognitiva operacional integrada ao runtime PecuariaTech,
            monitorando GMD, conversão alimentar, pressão de cocho,
            eficiência nutricional, estresse térmico e governança produtiva.
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
            shadow-lg
          "
        >
          ONLINE
        </div>

      </div>

      <div
        className="
          mt-8
          grid
          gap-5
          md:grid-cols-4
        "
      >

        <Card
          title="GMD Inteligente"
          value={String(gmd)}
        />

        <Card
          title="Conversão"
          value={String(conversao)}
        />

        <Card
          title="Eficiência"
          value={`${eficiencia}%`}
        />

        <Card
          title="Risco"
          value={risco}
        />

      </div>

      <div
        className="
          mt-8
          rounded-[30px]
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
            tracking-[0.25em]
            text-slate-500
          "
        >
          ENGINES COGNITIVAS
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
            "GMD ENGINE",
            "COCHO AI",
            "THERMAL AI",
            "NUTRITION AI",
            "LOTE AI",
            "PESO EVOLUTIVO",
            "ESG AI",
            "COMPLIANCE AI",
          ].map((item) => (

            <div
              key={item}
              className="
                rounded-full
                border
                border-emerald-200
                bg-white
                px-5
                py-3
                text-sm
                font-black
                tracking-[0.18em]
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
                px-5
                py-4
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

      <div
        className="
          mt-8
          rounded-[28px]
          border
          border-emerald-100
          bg-gradient-to-r
          from-emerald-50
          to-white
          p-6
        "
      >

        <div
          className="
            text-xs
            font-black
            tracking-[0.25em]
            text-emerald-700
          "
        >
          DECISÃO EXECUTIVA
        </div>

        <div
          className="
            mt-3
            text-2xl
            font-black
            text-slate-950
          "
        >
          {decisao ??
            "Manter protocolo nutricional e monitorar eficiência térmica."}
        </div>

      </div>

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
        rounded-[28px]
        border
        border-slate-100
        bg-slate-50
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
          tracking-tight
          text-slate-950
        "
      >
        {value}
      </div>

    </div>
  );
}