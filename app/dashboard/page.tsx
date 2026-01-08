// app/dashboard/page.tsx
// DASHBOARD HUB — CONTROLADOR CENTRAL DO PECUARIATECH
// Regra: tudo parte daqui (Equação Y)

import Link from "next/link";

export default function DashboardHubPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* CABEÇALHO */}
        <header>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard PecuariaTech
          </h1>
          <p className="text-gray-600 mt-1">
            Centro de controle da fazenda
          </p>
        </header>

        {/* KPIs — RESUMO GERAL */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Animais</p>
            <p className="text-3xl font-bold text-green-700 mt-2">
              1.247
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Receita</p>
            <p className="text-3xl font-bold text-green-700 mt-2">
              R$ 124.580
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Produtividade</p>
            <p className="text-3xl font-bold text-green-700 mt-2">
              87%
            </p>
          </div>
        </section>

        {/* NAVEGAÇÃO — CONTROLE TOTAL */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Módulos do Sistema
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            <Link
              href="/dashboard/financeiro"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Financeiro
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Fluxo de caixa, custos, receitas e indicadores
              </p>
            </Link>

            <Link
              href="/dashboard/rebanho"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Rebanho
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Controle de animais e desempenho produtivo
              </p>
            </Link>

            <Link
              href="/dashboard/pastagem"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Pastagem
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Gestão de áreas, lotação e sustentabilidade
              </p>
            </Link>

            <Link
              href="/dashboard/cfo"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                CFO Autônomo
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Análises estratégicas e inteligência financeira
              </p>
            </Link>

          </div>
        </section>

        {/* MENSAGEM DE ESTADO DO SISTEMA */}
        <section className="bg-green-50 border border-green-200 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-green-800">
            Sistema organizado e sob controle
          </h3>
          <p className="text-green-700 mt-2">
            Todos os módulos estão centralizados neste painel.
            Nenhuma funcionalidade foi perdida.
          </p>
        </section>

      </div>
    </main>
  );
}
