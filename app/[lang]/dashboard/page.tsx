import KpiCard from "@/app/components/ui/KpiCard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#eef2ef] p-10">

      <div className="mx-auto max-w-7xl space-y-10">

        {/* HERO */}
        <section
          className="
            rounded-[36px]
            border border-[#4e7b5d]
            bg-gradient-to-br
            from-[#2f6a45]
            via-[#1f5236]
            to-[#163a28]
            p-12
            shadow-2xl
          "
        >

          {/* TITULO */}
          <div className="max-w-5xl">

            <div
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-[#7ab089]
                bg-[#295239]
                px-5 py-2
                text-sm font-medium
                text-[#b8f5c9]
              "
            >
              IA operacional estabilizada
            </div>

            <h1
              className="
                mt-8
                text-7xl
                font-black
                tracking-tight
                text-white
              "
            >
              PecuariaTech
            </h1>

            <h2
              className="
                mt-4
                text-5xl
                font-bold
                tracking-tight
                text-[#dff7e7]
              "
            >
              Dashboard Executivo
            </h2>

            <p
              className="
                mt-8
                max-w-4xl
                text-2xl
                leading-relaxed
                text-[#d7f3df]/85
              "
            >
              Plataforma operacional analítica para gestão
              inteligente, financeira e estratégica da operação
              pecuária.
            </p>

          </div>

          {/* KPIS */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">

            <KpiCard
              title="EBITDA"
              value="R$ 1.240.000"
              trend="↑ 12.4% nos últimos 30 dias"
              insight="IA detecta estabilidade financeira operacional."
            />

            <KpiCard
              title="Margem Operacional"
              value="18.2%"
              trend="↑ crescimento consistente"
              insight="Margem operacional acima da média consolidada."
            />

            <KpiCard
              title="Custo Alimentar"
              value="R$ 482.000"
              trend="↓ redução de 4.1%"
              insight="Eficiência alimentar apresentou melhora contínua."
            />

          </div>

        </section>

        {/* GRID */}
        <section className="grid gap-8 lg:grid-cols-3">

          {/* FINANCEIRO */}
          <div
            className="
              lg:col-span-2
              rounded-[36px]
              border border-[#4d7358]
              bg-gradient-to-br
              from-[#294534]
              to-[#1b2f24]
              p-10
              shadow-xl
            "
          >

            <div className="flex items-center justify-between">

              <h2 className="text-5xl font-black text-white">
                Inteligência Financeira
              </h2>

              <div
                className="
                  rounded-full
                  bg-[#3c6b4a]
                  px-5 py-2
                  text-sm
                  font-medium
                  text-[#c5f7d3]
                "
              >
                Estável
              </div>

            </div>

            <p
              className="
                mt-8
                max-w-4xl
                text-xl
                leading-relaxed
                text-[#d8f3df]/80
              "
            >
              A operação mantém crescimento sustentável mesmo
              sob pressão parcial de custos produtivos.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">

              {[
                {
                  title: "Fluxo Financeiro",
                  value: "Estável",
                  color: "text-green-300",
                },
                {
                  title: "Receita",
                  value: "Crescimento",
                  color: "text-green-300",
                },
                {
                  title: "Tendência",
                  value: "Monitoramento",
                  color: "text-yellow-300",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="
                    rounded-3xl
                    border border-[#4d7358]
                    bg-[#203427]
                    p-7
                  "
                >

                  <div className="text-sm text-[#d7f3df]/60">
                    {item.title}
                  </div>

                  <div
                    className={`mt-5 text-3xl font-black ${item.color}`}
                  >
                    {item.value}
                  </div>

                </div>
              ))}

            </div>

          </div>

          {/* IA */}
          <div
            className="
              rounded-[36px]
              border border-[#4d7358]
              bg-gradient-to-br
              from-[#27503a]
              to-[#183325]
              p-10
              shadow-2xl
            "
          >

            <div className="flex items-center justify-between">

              <h2 className="text-5xl font-black text-white">
                IA Operacional
              </h2>

              <div
                className="
                  rounded-full
                  bg-[#0b6b63]
                  px-5 py-2
                  text-sm
                  font-medium
                  text-cyan-200
                "
              >
                Online
              </div>

            </div>

            <div className="mt-10 space-y-6">

              {[
                "IA detectou estabilidade de margem operacional.",
                "Eficiência alimentar acima da média histórica.",
                "Cenário operacional indica tendência sustentável.",
              ].map((item) => (
                <div
                  key={item}
                  className="
                    rounded-3xl
                    border border-[#4d7358]
                    bg-[#203427]
                    p-6
                    text-lg
                    leading-relaxed
                    text-[#d8f3df]/85
                  "
                >
                  {item}
                </div>
              ))}

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}