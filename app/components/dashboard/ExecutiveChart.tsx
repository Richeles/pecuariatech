"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  {
    mes: "Jan",
    receita: 82,
    eficiencia: 71,
    esg: 64,
  },
  {
    mes: "Fev",
    receita: 98,
    eficiencia: 76,
    esg: 68,
  },
  {
    mes: "Mar",
    receita: 112,
    eficiencia: 81,
    esg: 74,
  },
  {
    mes: "Abr",
    receita: 129,
    eficiencia: 86,
    esg: 79,
  },
  {
    mes: "Mai",
    receita: 145,
    eficiencia: 89,
    esg: 83,
  },
  {
    mes: "Jun",
    receita: 162,
    eficiencia: 93,
    esg: 88,
  },
];

export default function ExecutiveChart() {

  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-[40px]
        border
        border-emerald-500/10
        bg-gradient-to-br
        from-[#02150d]
        via-[#031b11]
        to-[#041f15]
        p-8
        shadow-[0_0_80px_rgba(16,185,129,0.10)]
      "
    >

      {/* FX */}

      <div
        className="
          absolute
          right-[-120px]
          top-[-120px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-emerald-500/10
          blur-3xl
        "
      />

      <div className="relative z-10">

        {/* TOP */}

        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <div
              className="
                text-sm
                font-black
                uppercase
                tracking-[0.25em]
                text-emerald-300
              "
            >
              Runtime Cognitivo
            </div>

            <h2
              className="
                mt-4
                text-4xl
                xl:text-5xl
                font-black
                text-white
              "
            >
              Performance Operacional
            </h2>

            <p
              className="
                mt-4
                max-w-3xl
                text-lg
                leading-8
                text-emerald-100/70
              "
            >
              Evolução financeira, eficiência operacional e índice ESG integrados ao runtime executivo da fazenda.
            </p>

          </div>

          {/* BADGE */}

          <div
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-5
              py-3
              text-sm
              font-bold
              text-emerald-300
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

            IA EXECUTIVA ONLINE

          </div>

        </div>

        {/* CHART */}

        <div className="mt-12 h-[460px]">

          <ResponsiveContainer width="100%" height="100%">

            <AreaChart data={data}>

              <defs>

                <linearGradient
                  id="receitaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#34d399"
                    stopOpacity={0.5}
                  />

                  <stop
                    offset="100%"
                    stopColor="#34d399"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />

              <XAxis
                dataKey="mes"
                stroke="#9ae6b4"
              />

              <YAxis
                stroke="#9ae6b4"
              />

              <Tooltip
                contentStyle={{
                  background: "#04140d",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />

              {/* RECEITA */}

              <Area
                type="monotone"
                dataKey="receita"
                stroke="#34d399"
                strokeWidth={4}
                fill="url(#receitaGradient)"
              />

              {/* EFICIENCIA */}

              <Line
                type="monotone"
                dataKey="eficiencia"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={false}
              />

              {/* ESG */}

              <Line
                type="monotone"
                dataKey="esg"
                stroke="#a3e635"
                strokeWidth={3}
                dot={false}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>

    </section>

  );
}