import { Suspense } from "react";
import RebanhoClient from "./components/RebanhoClient";

export default function RebanhoPage() {
  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Rebanho (Real)</h1>
        <p className="text-gray-600">
          Visão consolidada do rebanho via rastreabilidade canônica (view).
        </p>
      </header>

      <Suspense fallback={<p className="text-gray-500">Carregando…</p>}>
        <RebanhoClient />
      </Suspense>
    </main>
  );
}
