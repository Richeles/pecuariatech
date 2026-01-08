// app/page.tsx
// HOME INSTITUCIONAL — RESET DEFINITIVO

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        PecuariaTech
      </h1>

      <p className="text-gray-600 max-w-2xl mb-8">
        Gestão pecuária inteligente para quem busca
        controle real, decisões seguras e crescimento sustentável.
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Entrar
        </Link>

        <Link
          href="/planos"
          className="border border-green-600 text-green-700 px-6 py-3 rounded-lg hover:bg-green-50"
        >
          Ver Planos
        </Link>
      </div>
    </main>
  );
}
