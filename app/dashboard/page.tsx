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
          <T k="dashboard_titulo" /> PecuariaTech
        </h1>

        <p className="text-gray-400">
          <T k="centro_controle" />
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
          <T k="modulos_sistema" />
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

                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-lg">
                  {mod.icon}
                </div>

                <h3 className="font-semibold text-gray-900 text-lg">
                  <T k={mod.title} />
                </h3>

                <p className="text-sm text-gray-500">
                  <T k={mod.desc} />
                </p>

              </div>

              <div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 group-hover:translate-x-1 transition-transform">
                  <T k="acessar" />
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
          <T k="sistema_ok" />
        </p>

        <p className="text-green-700 text-sm">
          <T k="sistema_desc" />
        </p>

      </section>

    </main>
  );
}