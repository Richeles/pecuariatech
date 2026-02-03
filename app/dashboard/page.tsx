// app/dashboard/page.tsx
// DASHBOARD HOME PREMIUM - PECUARIATECH

import Link from "next/link";

export default function DashboardHome() {
  return (
    <main className="p-8 space-y-10 max-w-7xl mx-auto">

      {/* ================= HEADER ================= */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Visão geral da operação
        </p>
      </header>

      {/* ================= KPIs ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Kpi title="Rebanho" value="1.247 animais" />
        <Kpi title="Financeiro" value="R$ 124.580" />
        <Kpi title="Engorda" value="72% em meta" />
        <Kpi title="Resultado" value="Positivo" />

      </section>

      {/* ================= MÓDULOS ================= */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Módulos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Module
            title="Financeiro"
            desc="Custos, receitas, indicadores e DRE"
            href="/dashboard/financeiro"
          />

          <Module
            title="Rebanho"
            desc="Controle individual e desempenho"
            href="/dashboard/rebanho"
          />

          <Module
            title="Pastagem"
            desc="Gestão de áreas e lotação"
            href="/dashboard/pastagem"
          />

          <Module
            title="Engorda"
            desc="Projeções e cenários"
            href="/dashboard/engorda"
          />

        </div>
      </section>

      {/* ================= STATUS ================= */}
      <section className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-green-800 text-sm">
          Sistema operacional • Dados sincronizados • Ambiente estável
        </p>
      </section>

    </main>
  );
}

/* ================= COMPONENTES LOCAIS ================= */

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">
        {value}
      </p>
    </div>
  );
}

function Module({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 mt-1 text-sm">
        {desc}
      </p>
    </Link>
  );
}
