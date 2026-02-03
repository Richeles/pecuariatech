import { Suspense } from "react";
import RebanhoClient from "./components/RebanhoClient";

export default function RebanhoPage() {
  return (
    <main className="p-10 max-w-7xl mx-auto space-y-12">

      {/* ================= HEADER ================= */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Rebanho (Real)
        </h1>
        <p className="text-gray-500 mt-1">
          Visão consolidada do rebanho via rastreabilidade canônica (view)
        </p>
      </header>

      {/* ================= CONTEÚDO ================= */}
      <Suspense
        fallback={
          <p className="text-sm text-gray-500">
            Carregando rebanho…
          </p>
        }
      >
        <RebanhoClient />
      </Suspense>

    </main>
  );
}
