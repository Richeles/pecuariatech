// app/dashboard/engorda/page.tsx

import EngordaClient from "./components/EngordaClient";

export const dynamic = "force-dynamic";

export default function EngordaPage() {
  return (
    <main className="p-10 max-w-7xl mx-auto space-y-12">

      {/* ================= HEADER ================= */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Engorda ULTRA
        </h1>
        <p className="text-gray-500 mt-1">
          Motor π com 3 cenários (ÓTIMO / SEGURO / RÁPIDO), ranking executivo e alertas.
        </p>
      </header>

      {/* ================= CONTEÚDO ================= */}
      <EngordaClient />

    </main>
  );
}
