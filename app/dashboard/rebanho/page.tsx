// Rebanho PecuariaTech — Rastreabilidade Biológica
// Server Component | Next.js 16

import RebanhoClient from "./components/RebanhoClient";

export default function RebanhoPage() {
  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          Rebanho · Rastreabilidade e Regência
        </h1>
        <p className="text-gray-600">
          Gestão biológica do rebanho com histórico completo de origem,
          movimentação e manejo.
        </p>
      </header>

      <RebanhoClient />

      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">
          Diagnóstico do Rebanho
        </h3>
        <p className="text-sm text-gray-600">
          Nenhum animal cadastrado ainda.
          <br />
          O sistema foi projetado para preservar o histórico completo do animal,
          da origem ao abate.
        </p>
      </section>

      <section className="rounded-xl border border-green-300 bg-green-50 p-6">
        <h3 className="font-semibold text-green-800">
          Regência Executiva em Ambiente de Risco
        </h3>
        <p className="text-sm text-green-700 mt-2">
          O PecuariaTech não apenas registra dados, mas constrói uma linha do
          tempo auditável da proteína produzida, integrando solo, manejo e
          decisões econômicas.
        </p>
      </section>
    </main>
  );
}
