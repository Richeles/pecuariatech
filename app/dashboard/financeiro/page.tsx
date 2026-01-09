// app/dashboard/financeiro/page.tsx
// Financeiro PecuariaTech — Visão CFO
// Server Component | Next.js 16 App Router

import { Suspense } from "react";
import FinanceiroClient from "./FinanceiroClient";

export default function FinanceiroPage() {
  return (
    <main className="space-y-8">
      {/* CABEÇALHO */}
      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          Financeiro · Visão CFO
        </h1>
        <p className="text-gray-600">
          Controle financeiro, análise estratégica e base para decisões
          inteligentes.
        </p>
      </header>

      {/* KPIs — DADOS REAIS (VIEW financeiro_resumo_view) */}
      <Suspense fallback={<p className="text-sm text-gray-500">Carregando financeiro…</p>}>
        <FinanceiroClient />
      </Suspense>

      {/* ALERTA CFO */}
      <section>
        <AlertaCFO />
      </section>

      {/* ACESSO AO DRE (SUBMÓDULO OFICIAL) */}
      <section className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800">
          DRE — Demonstrativo de Resultado
        </h3>

        <p className="text-sm text-gray-600 mt-1">
          Visualize o resultado econômico completo da fazenda, com
          detalhamento de receitas, custos e lucro, analisado
          automaticamente pelo CFO Autônomo.
        </p>

        <div className="mt-4">
          <a
            href="/dashboard/financeiro/dre"
            className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
          >
            Ver DRE
          </a>
        </div>
      </section>

      {/* VISÃO ESTRATÉGICA */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card titulo="Diagnóstico Financeiro">
          <p className="text-sm text-gray-600">
            Nenhum dado financeiro foi lançado ainda.
            <br />
            Comece registrando receitas e custos para liberar análises
            automáticas.
          </p>
        </Card>

        <Card titulo="Próximos Passos">
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Registrar receitas e custos</li>
            <li>Acompanhar margem e fluxo de caixa</li>
            <li>Receber diagnósticos do CFO Autônomo</li>
          </ul>
        </Card>
      </section>

      {/* IA — FUTURO PRÓXIMO */}
      <section className="rounded-xl border border-green-300 bg-green-50 p-6">
        <h3 className="font-semibold text-green-800">
          CFO Autônomo (em aprendizado)
        </h3>
        <p className="text-sm text-green-700 mt-2">
          À medida que você usar o sistema, o PecuariaTech aprenderá com
          suas decisões financeiras para oferecer recomendações cada vez
          mais precisas — sempre de forma segura, anônima e sem expor
          produtores de destaque.
        </p>
      </section>
    </main>
  );
}

/* COMPONENTES INTERNOS */

function Card({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-2">{titulo}</h3>
      {children}
    </div>
  );
}

function AlertaCFO() {
  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
      <p className="text-sm text-yellow-800">
        ⚠️ O CFO Autônomo será ativado após os primeiros lançamentos
        financeiros. Nenhuma análise é feita sem dados reais.
      </p>
    </div>
  );
}
