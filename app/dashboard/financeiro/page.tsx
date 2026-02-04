// app/dashboard/financeiro/page.tsx
import { Suspense } from "react";
import FinanceiroClient from "./components/FinanceiroClient";

export const dynamic = "force-dynamic";

export default function FinanceiroPage() {
  return (
    <main className="p-10 max-w-7xl mx-auto space-y-12">

      {/* ================= HEADER ================= */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Financeiro · Visão CFO
        </h1>
        <p className="text-gray-500">
          Controle financeiro, análise estratégica e base para decisões inteligentes
        </p>
      </header>

      {/* ================= KPI PRINCIPAIS ================= */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {[
          { label: "Receita", value: "—" },
          { label: "Custos", value: "—" },
          { label: "Resultado", value: "—", active: true },
          { label: "Margem", value: "—" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`
              bg-white rounded-2xl border p-6
              flex flex-col gap-2
              transition
              ${
                kpi.active
                  ? "border-green-400 bg-green-50/40"
                  : "border-gray-200 hover:border-green-300"
              }
            `}
          >
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-green-700">{kpi.value}</p>
          </div>
        ))}

      </section>

      {/* ================= DIAGNÓSTICO CFO ================= */}
      <section className="bg-white border border-gray-200 rounded-2xl p-8">

        <h2 className="text-lg font-semibold text-gray-900">
          Diagnóstico Financeiro (CFO)
        </h2>

        <p className="text-gray-500 mt-2">
          Nenhum dado financeiro disponível ainda.
          Registre receitas e custos para liberar análises automáticas.
        </p>

      </section>

      {/* ================= ALERTA ATIVAÇÃO ================= */}
      <section className="bg-yellow-50 border border-yellow-300 rounded-xl p-5">

        <p className="text-yellow-800 text-sm">
          ⚠ O CFO Autônomo será ativado após os primeiros lançamentos financeiros.
          Nenhuma análise é feita sem dados reais.
        </p>

      </section>

      {/* ================= DRE ================= */}
      <section className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center justify-between">

        <div>
          <h3 className="font-semibold text-gray-900">
            DRE — Demonstrativo de Resultado
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Visualize o resultado econômico completo da fazenda.
          </p>
        </div>

        <button
          className="
            px-5 py-2.5 rounded-lg
            bg-green-600 text-white text-sm font-medium
            hover:bg-green-700 transition
          "
        >
          Ver DRE
        </button>

      </section>

      {/* ================= CLIENT ================= */}
      <Suspense fallback={null}>
        <FinanceiroClient />
      </Suspense>

    </main>
  );
}
