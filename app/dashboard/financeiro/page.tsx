// CAMINHO: app/dashboard/financeiro/page.tsx
// Dashboard Financeiro REAL — PecuariaTech
// Server Component (Next.js 16)

import { Suspense } from "react";
import FinanceiroClient from "./FinanceiroClient";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Financeiro · Visão Geral
      </h1>

      <Suspense fallback={<p>Carregando indicadores financeiros...</p>}>
        <FinanceiroClient />
      </Suspense>
    </div>
  );
}
