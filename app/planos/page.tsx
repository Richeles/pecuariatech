// CAMINHO: app/planos/page.tsx
// Planos PecuariaTech — Server Component
// Next.js 16 + App Router

import { Suspense } from "react";
import PlanosClient from "./PlanosClient";

export default function PlanosPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-bold">
            Planos PecuariaTech
          </h1>
          <p className="text-gray-600">
            Cada plano foi pensado para uma realidade diferente no campo —
            do controle básico à gestão com IA e CFO Autônomo.
          </p>
        </header>

        <Suspense fallback={<div />}>
          <PlanosClient />
        </Suspense>
      </div>
    </main>
  );
}
