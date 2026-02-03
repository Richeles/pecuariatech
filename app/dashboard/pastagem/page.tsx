// app/dashboard/pastagem/page.tsx

import React, { Suspense } from "react";
import PastagemSafe from "./components/PastagemSafe";

export const dynamic = "force-dynamic";

export default function PastagemPage() {
  return (
    <main className="p-10 max-w-7xl mx-auto space-y-12">

      {/* ================= HEADER ================= */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Pastagem
        </h1>
        <p className="text-gray-500 mt-1">
          Gestão operacional das áreas, pressão de pastejo e risco produtivo
        </p>
      </header>

      {/* ================= CONTEÚDO ================= */}
      <Suspense
        fallback={
          <p className="text-sm text-gray-500">
            Carregando Pastagem…
          </p>
        }
      >
        <PastagemSafe />
      </Suspense>

    </main>
  );
}
