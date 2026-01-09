// app/dashboard/financeiro/dre/page.tsx
// DRE PecuariaTech — Demonstrativo de Resultado
// Server Component | Next.js 16 App Router

import { Suspense } from "react";
import DreClient from "./DreClient";

export default function DrePage() {
  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          DRE — Demonstrativo de Resultado
        </h1>
        <p className="text-gray-600">
          Resultado econômico mensal da fazenda, com base em dados reais.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-gray-500">Carregando DRE…</p>}>
        <DreClient />
      </Suspense>
    </main>
  );
}
