import { Suspense } from "react";
import PlanosClient from "./PlanosClient";

export const dynamic = "force-dynamic";

export default function PlanosPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold">Planos PecuariaTech</h1>
          <p className="text-gray-600">
            Escolha o plano ideal para sua fazenda.
          </p>
        </header>

        <Suspense fallback={<div>Carregando planos...</div>}>
          <PlanosClient />
        </Suspense>
      </div>
    </main>
  );
}
