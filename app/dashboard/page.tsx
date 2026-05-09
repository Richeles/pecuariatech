import T from "@/app/components/T";
import CFORealCard from "@/app/components/cfo/CFORealCard";

export default function DashboardHome() {
  return (
    <main className="min-h-screen bg-[#08140d] text-white">

      {/* FUNDO EXECUTIVO */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(38,90,55,0.20),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-14 p-8">

        {/* ================= HEADER ================= */}
        <header className="space-y-4 border-b border-[#1d3324] pb-8">

          <div className="inline-flex items-center rounded-full border border-[#295135] bg-[#173222] px-4 py-2 text-sm text-green-300 shadow-lg">
            IA operacional estabilizada
          </div>

          <div>

            <h1 className="text-5xl font-bold tracking-tight text-white">
              PecuariaTech
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-green-100/70">
              Plataforma operacional analítica para gestão inteligente,
              financeira e estratégica da operação pecuária.
            </p>

          </div>

        </header>

        {/* ================= KPIs ================= */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {[
            {
              label: "kpi_animais",
              value: "1.247",
              hint: "kpi_total_rastreado",
              active: true,
            },
            {
              label: "kpi_receita",
              value: "R$ 124.580",
              hint: "kpi_mes_corrente",
            },
            {
              label: "kpi_produtividade",
              value: "87%",
              hint: "kpi_indice_medio",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`
                relative overflow-hidden
                rounded-3xl
                border border-[#295135]
                bg-[#102117]/90
                p-8
                shadow-2xl
                backdrop-blur
                transition-all duration-300
                hover:border-green-400/40
              `}
            >

              {/* LINHA SUPERIOR */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-green-500/70 to-green-300/10" />

              <div className="space-y-5">

                <div>

                  <p className="text-sm text-green-100/50">
                    <T k={kpi.label} />
                  </p>

                  <p className="mt-3 text-5xl font-bold tracking-tight text-white">
                    {kpi.value}
                  </p>

                </div>

                <p className="text-sm text-green-100/60">
                  <T k={kpi.hint} />
                </p>

              </div>

            </div>
          ))}

        </section>

        {/* ================= CFO ================= */}
        <section className="space-y-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-3xl font-semibold text-white">
                Inteligência Financeira
              </h2>

              <p className="mt-2 text-green-100/60">
                Análise operacional consolidada da fazenda
              </p>

            </div>

            <div className="rounded-full border border-[#295135] bg-[#173222] px-4 py-2 text-sm text-green-300">
              CFO Online
            </div>

          </div>

          <CFORealCard />

        </section>

        {/* ================= MÓDULOS ================= */}
        <section className="space-y-8">

          <div>

            <h2 className="text-3xl font-semibold text-white">
              Módulos Estratégicos
            </h2>

            <p className="mt-2 text-green-100/60">
              Núcleos operacionais integrados do sistema executivo rural
            </p>

          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "modulo_financeiro",
                desc: "desc_financeiro",
                icon: "💰",
              },
              {
                title: "modulo_rebanho",
                desc: "desc_rebanho",
                icon: "🐄",
              },
              {
                title: "modulo_pastagem",
                desc: "desc_pastagem",
                icon: "🌱",
              },
              {
                title: "modulo_cfo",
                desc: "desc_cfo",
                icon: "🧠",
              },
            ].map((mod) => (
              <div
                key={mod.title}
                className="
                  rounded-3xl
                  border border-[#295135]
                  bg-[#102117]/90
                  p-7
                  shadow-2xl
                  transition-all duration-300
                  hover:border-green-400/40
                  hover:bg-[#173222]
                "
              >

                <div className="text-3xl">
                  {mod.icon}
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  <T k={mod.title} />
                </h3>

                <p className="mt-3 text-sm leading-7 text-green-100/60">
                  <T k={mod.desc} />
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* ================= STATUS ================= */}
        <section className="rounded-3xl border border-[#295135] bg-gradient-to-r from-[#173222] to-[#102117] p-8 shadow-2xl">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm uppercase tracking-wide text-green-200/60">
                Sistema Operacional
              </p>

              <h3 className="mt-2 text-3xl font-semibold text-white">
                Plataforma estabilizada
              </h3>

              <p className="mt-3 max-w-2xl leading-7 text-green-100/70">
                Todos os módulos operacionais estão sincronizados,
                protegidos e funcionando dentro da arquitetura analítica integrada.
              </p>

            </div>

            <div className="rounded-2xl border border-[#295135] bg-[#0b1811]/80 px-6 py-5">

              <div className="flex items-center gap-3 text-green-300">

                <div className="h-3 w-3 rounded-full bg-green-400" />

                Operação online

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}