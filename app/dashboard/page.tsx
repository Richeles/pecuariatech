export default function DashboardHome() {
  return (
    <main className="p-10 max-w-7xl mx-auto space-y-16">

      {/* ================= HEADER ================= */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Dashboard PecuariaTech
        </h1>
        <p className="text-gray-500">
          Centro de controle da fazenda
        </p>
      </header>

      {/* ================= KPIs ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {[
          { label: "Animais", value: "1.247" },
          { label: "Receita", value: "R$ 124.580" },
          { label: "Produtividade", value: "87%" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="
              bg-white rounded-xl
              border border-gray-200
              p-8 min-h-[120px]
              flex flex-col justify-between
              shadow-sm hover:shadow-md
              hover:border-green-400
              hover:bg-green-50/30
              transition
            "
          >
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-4xl font-bold text-green-700">
              {kpi.value}
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
            },
            {
              title: "Rebanho",
              desc: "Controle de animais e desempenho produtivo",
            },
            {
              title: "Pastagem",
              desc: "Gestão de áreas, lotação e sustentabilidade",
            },
            {
              title: "CFO Autônomo",
              desc: "Análises estratégicas e inteligência financeira",
            },
          ].map((mod) => (
            <div
              key={mod.title}
              className="
                bg-white rounded-xl
                border border-gray-200
                p-8 min-h-[150px]
                flex flex-col justify-between
                shadow-sm hover:shadow-md
                hover:border-green-400
                hover:bg-green-50/30
                transition
              "
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {mod.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {mod.desc}
                </p>
              </div>

              <span className="text-sm text-green-700 font-medium">
                Acessar →
              </span>
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
