// app/dashboard/cfo/page.tsx
// CFO AUTÔNOMO — Página isolada (Server Component)
// Regra: NÃO tocar no HUB /dashboard (intocável)
// Equação Y: este módulo apenas consome API read-only

import { Suspense } from "react";
import CFOInsightsClient from "./CFOInsightsClient";

export default function CFOPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* CABEÇALHO */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">CFO Autônomo</h1>
          <p className="text-gray-600">
            Inteligência financeira baseada em DRE e sinais (Equação Y + Triângulo 360).
          </p>
        </header>

        {/* CONTEÚDO — Client Component isolado */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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

        {/* NOTAS DE SEGURANÇA */}
        <section className="bg-green-50 border border-green-200 p-5 rounded-2xl">
          <h3 className="text-lg font-bold text-green-800">
            CFO isolado e blindado (Equação Y)
          </h3>
          <p className="text-green-700 mt-2">
            Esta página não altera HUB, não altera Router, não altera banco.
            Apenas consome a API read-only:{" "}
            <code className="px-1 py-0.5 bg-green-100 rounded">
              /api/inteligencia/financeiro
            </code>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
