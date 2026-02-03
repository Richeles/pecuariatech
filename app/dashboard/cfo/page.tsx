// app/dashboard/cfo/page.tsx
// CFO AUTÔNOMO — Página isolada (Server Component)
// Regra: NÃO tocar no HUB /dashboard (intocável)
// Equação Y: este módulo apenas consome API read-only

import { Suspense } from "react";
import CFOInsightsClient from "./CFOInsightsClient";

export default function CFOPage() {
  return (
    <main className="p-10 max-w-7xl mx-auto space-y-8">

      {/* CABEÇALHO */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          CFO Autônomo
        </h1>
        <p className="text-gray-600">
          Inteligência financeira baseada em DRE e sinais (Equação Y + Triângulo 360).
        </p>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <section className="bg-white rounded-xl shadow-sm border p-6">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-64 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
              <div className="h-10 w-40 bg-gray-200 rounded mt-4" />
            </div>
          }
        >
          <CFOInsightsClient />
        </Suspense>
      </section>

      {/* NOTA DE SEGURANÇA */}
      <section className="rounded-xl border border-green-300 bg-green-50 p-6">
        <h3 className="font-semibold text-green-800">
          CFO isolado e blindado (Equação Y)
        </h3>
        <p className="text-sm text-green-700 mt-2">
          Esta página não altera HUB, não altera Router, não altera banco.
          Apenas consome a API read-only:{" "}
          <code className="px-1 py-0.5 bg-green-100 rounded">
            /api/inteligencia/financeiro
          </code>
          .
        </p>
      </section>

    </main>
  );
}
