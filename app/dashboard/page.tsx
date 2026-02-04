export default function DashboardHome() {
  return (
    <main className="p-10 max-w-7xl mx-auto space-y-16">

      {/* ================= HEADER ================= */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Dashboard PecuariaTech
        </h1>
        <p className="text-gray-400">
          Centro de controle da fazenda
        </p>
      </header>

      {/* ================= KPIs ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {[
          {
            label: "Animais",
            value: "1.247",
            hint: "Total rastreado",
            active: true,
          },
          {
            label: "Receita",
            value: "R$ 124.580",
            hint: "Mês corrente",
          },
          {
            label: "Produtividade",
            value: "87%",
            hint: "Índice médio",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`
              relative overflow-hidden
              bg-white rounded-2xl
              border
              p-8 min-h-[130px]
              flex flex-col justify-between
              transition-all
              ${
                kpi.active
                  ? "border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.2)] bg-green-50/40"
                  : "border-gray-200 hover:border-green-300 hover:bg-green-50/20"
              }
            `}
          >
            {/* Linha superior sutil */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-green-500/60 to-green-300/20" />

            <div>
              <p className="text-sm text-gray-500">
                {kpi.label}
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-green-700">
                {kpi.value}
              </p>
            </div>

            <p className="text-xs text-gray-400">
              {kpi.hint}
            </p>
          </div>
        ))}

      </section>

      {/* ================= MÓDULOS ================= */}
      <section className="space-y-6">

        <h2 className="text-xl font-semibold text-gray-900">
          Módulos do Sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {[
            {
              title: "Financeiro",
              desc: "Fluxo de caixa, custos, receitas e indicadores",
              icon: "💰",
            },
            {
              title: "Rebanho",
              desc: "Controle de animais e desempenho produtivo",
              icon: "🐄",
            },
            {
              title: "Pastagem",
              desc: "Gestão de áreas, lotação e sustentabilidade",
              icon: "🌱",
            },
            {
              title: "CFO Autônomo",
              desc: "Análises estratégicas e inteligência financeira",
              icon: "🧠",
            },
          ].map((mod) => (
            <div
              key={mod.title}
              role="button"
              tabIndex={0}
              className="
                group cursor-pointer
                bg-white rounded-2xl
                border border-gray-200
                p-8 min-h-[170px]
                flex flex-col justify-between
                transition-all
                hover:border-green-400
                hover:bg-green-50/30
                hover:shadow-md
              "
            >
              <div className="space-y-3">

                {/* Ícone */}
                <div
                  className="
                    w-10 h-10
                    rounded-lg
                    bg-green-100
                    text-green-700
                    flex items-center justify-center
                    text-lg
                  "
                >
                  {mod.icon}
                </div>

                {/* Título */}
                <h3 className="font-semibold text-gray-900 text-lg">
                  {mod.title}
                </h3>

                {/* Descrição */}
                <p className="text-sm text-gray-500">
                  {mod.desc}
                </p>

              </div>

              {/* CTA */}
              <div>
                <span
                  className="
                    inline-flex items-center gap-1
                    text-sm font-medium
                    text-green-700
                    group-hover:translate-x-1
                    transition-transform
                  "
                >
                  Acessar
                  <span>→</span>
                </span>
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* ================= STATUS ================= */}
      <section className="bg-green-50 border border-green-200 rounded-xl p-8 space-y-2">

        <p className="text-green-800 font-medium">
          Sistema organizado e sob controle
        </p>

        <p className="text-green-700 text-sm">
          Todos os módulos estão centralizados neste painel. Nenhuma funcionalidade foi perdida.
        </p>

      </section>

    </main>
  );
}
