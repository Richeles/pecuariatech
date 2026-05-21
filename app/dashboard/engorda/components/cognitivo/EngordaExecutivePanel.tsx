"use client";

type Props = {
  total?: number;
  margem?: number;
  risco?: string;
  pi?: number;
  compliance?: number;
  esg?: string;
  alertas?: string[];
};

export default function EngordaExecutivePanel({

  total = 0,

  margem = 0,

  risco = "BAIXO",

  pi = 94,

  compliance = 96,

  esg = "VERDE",

  alertas = [],

}: Props) {

  return (

    <section className="space-y-5">

      {/* =====================================================
          HERO EXECUTIVO
      ===================================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[22px]
          border
          border-emerald-400/10
          bg-gradient-to-br
          from-[#03140d]
          via-[#062117]
          to-[#0b2d1f]
          p-5
          xl:p-6
          shadow-[0_10px_38px_rgba(0,0,0,0.16)]
        "
      >

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_35%)]
          "
        />

        <div
          className="
            relative
            z-10
            grid
            gap-5
            lg:grid-cols-[1.2fr_0.8fr]
          "
        >

          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-4">

            <div
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-emerald-400/15
                bg-emerald-500/10
                px-3
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.28em]
                text-emerald-200
              "
            >
              Ultra Biological Engorda Runtime
            </div>

            <div
              className="
                max-w-2xl
                text-2xl
                font-black
                leading-tight
                tracking-tight
                text-white
                xl:text-3xl
              "
            >
              Governança Cognitiva da Engorda
            </div>

            <p
              className="
                max-w-2xl
                text-sm
                leading-7
                text-emerald-50/80
              "
            >
              Runtime executivo integrado ao
              motor π cognitivo PecuariaTech,
              com inteligência biológica,
              eficiência nutricional,
              projeção operacional,
              rastreabilidade ESG
              e monitoramento contínuo.
            </p>

            {/* =====================================================
                CHIPS
            ===================================================== */}

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {[
                "π ENGINE",
                "GMD AI",
                "FEED AI",
                "RISK AI",
                "TRACEABILITY",
                "ESG",
                "BIOLOGICAL AI",
              ].map((item) => (

                <div
                  key={item}
                  className="
                    rounded-full
                    border
                    border-emerald-400/10
                    bg-emerald-500/5
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    tracking-[0.12em]
                    text-emerald-100
                  "
                >
                  {item}
                </div>

              ))}

            </div>

          </div>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
            "
          >

            <MetricCard
              label="Score π"
              value={pi}
            />

            <MetricCard
              label="Risco"
              value={risco}
            />

            <MetricCard
              label="Compliance"
              value={`${compliance}%`}
            />

            <MetricCard
              label="ESG"
              value={esg}
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          KPI GRID
      ===================================================== */}

      <div
        className="
          grid
          gap-4
          xl:grid-cols-3
        "
      >

        <KpiCard
          title="Animais em Engorda"
          value={String(total)}
          description="
            Lotes monitorados pelo runtime cognitivo.
          "
        />

        <KpiCard
          title="Margem Média"
          value={`R$ ${margem}`}
          description="
            Resultado operacional médio projetado.
          "
        />

        <KpiCard
          title="Governança ESG"
          value={esg}
          description="
            Conformidade ambiental integrada.
          "
        />

      </div>

      {/* =====================================================
          ALERTAS
      ===================================================== */}

      <div
        className="
          grid
          gap-3
          lg:grid-cols-2
        "
      >

        {(alertas.length
          ? alertas
          : [
              "Conversão alimentar acima do ideal.",
              "Ganho de peso abaixo do ótimo.",
              "Pressão térmica elevada.",
              "Ajustar estratégia nutricional.",
            ]
        ).map((alerta) => (

          <div
            key={alerta}
            className="
              rounded-xl
              border
              border-amber-300/30
              bg-amber-50/90
              px-4
              py-3
              text-sm
              font-medium
              text-amber-900
            "
          >
            {alerta}
          </div>

        ))}

      </div>

      {/* =====================================================
          CENÁRIOS π
      ===================================================== */}

      <div
        className="
          grid
          gap-4
          xl:grid-cols-3
        "
      >

        <ScenarioCard
          title="Cenário ÓTIMO"
          subtitle="Maior margem"
          description="
            Estratégia focada em eficiência alimentar
            e maximização operacional.
          "
        />

        <ScenarioCard
          title="Cenário SEGURO"
          subtitle="Menor risco"
          description="
            Estratégia balanceada priorizando
            estabilidade sanitária e previsibilidade.
          "
        />

        <ScenarioCard
          title="Cenário RÁPIDO"
          subtitle="Maior giro"
          description="
            Estratégia voltada à aceleração
            de giro e liquidez operacional.
          "
        />

      </div>

    </section>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({

  title,

  value,

  description,

}: {

  title: string;

  value: string;

  description: string;
}) {

  return (

    <div
      className="
        rounded-[22px]
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >

      <div
        className="
          text-[10px]
          font-black
          uppercase
          tracking-[0.2em]
          text-emerald-700
        "
      >
        {title}
      </div>

      <div
        className="
          mt-3
          text-3xl
          font-black
          text-slate-950
        "
      >
        {value}
      </div>

      <p
        className="
          mt-3
          text-sm
          leading-6
          text-slate-600
        "
      >
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({

  label,

  value,

}: {

  label: string;

  value: any;
}) {

  return (

    <div
      className="
        rounded-[20px]
        border
        border-emerald-400/10
        bg-white/5
        p-4
        backdrop-blur
      "
    >

      <div
        className="
          text-[9px]
          font-black
          uppercase
          tracking-[0.22em]
          text-emerald-200
        "
      >
        {label}
      </div>

      <div
        className="
          mt-2
          text-3xl
          font-black
          text-white
        "
      >
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   SCENARIO CARD
========================================================= */

function ScenarioCard({

  title,

  subtitle,

  description,

}: {

  title: string;

  subtitle: string;

  description: string;
}) {

  return (

    <div
      className="
        rounded-[22px]
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >

      <div
        className="
          text-[10px]
          font-black
          uppercase
          tracking-[0.2em]
          text-emerald-700
        "
      >
        {subtitle}
      </div>

      <div
        className="
          mt-2
          text-2xl
          font-black
          leading-tight
          text-slate-950
        "
      >
        {title}
      </div>

      <p
        className="
          mt-3
          text-sm
          leading-7
          text-slate-600
        "
      >
        {description}
      </p>

    </div>
  );
}