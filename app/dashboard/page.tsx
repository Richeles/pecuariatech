import T from "@/app/components/T";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import CFORealCard from "@/app/components/cfo/CFORealCard";

export default function DashboardHome() {
  return (
    <main className="p-10 max-w-7xl mx-auto space-y-16">

      {/* 🌍 IDIOMA */}
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      {/* ================= HEADER ================= */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          PecuariaTech
        </h1>

        <p className="text-gray-400">
          Plataforma de gestão inteligente do seu rebanho
        </p>
      </header>

      {/* ================= KPIs ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">

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
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-green-500/60 to-green-300/20" />

            <div>
              <p className="text-sm text-gray-500">
                <T k={kpi.label} />
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-green-700">
                {kpi.value}
              </p>
            </div>

            <p className="text-xs text-gray-400">
              <T k={kpi.hint} />
            </p>
          </div>
        ))}

      </section>

      {/* ================= CFO ================= */}
      <section className="space-y-4">
        <CFORealCard />
      </section>

      {/* ================= MÓDULOS ================= */}
      <section className="space-y-6">

        <h2 className="text-xl font-semibold text-gray-900">
          Módulos do sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

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
              className="bg-white rounded-2xl border p-8"
            >
              <h3 className="font-semibold text-gray-900 text-lg">
                <T k={mod.title} />
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                <T k={mod.desc} />
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* ================= STATUS ================= */}
      <section className="bg-green-50 border border-green-200 rounded-xl p-8 space-y-2">

        <p className="text-green-800 font-medium">
          Sistema operacional
        </p>

        <p className="text-green-700 text-sm">
          Todos os módulos estão ativos e funcionando corretamente.
        </p>

      </section>

    </main>
  );
}