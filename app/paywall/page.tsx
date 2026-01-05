// CAMINHO: app/paywall/page.tsx
// Paywall UX — Mock (sem Supabase)
// Next.js 16 + App Router

"use client";

import Link from "next/link";

export default function PaywallPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Acesso restrito
        </h1>

        <p className="text-gray-600">
          Seu período de teste terminou ou este recurso
          está disponível apenas para planos ativos.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          Continue usando o PecuariaTech e tenha acesso
          completo ao painel, relatórios e recursos
          inteligentes.
        </div>

        <div className="space-y-3">
          <Link
            href="/planos"
            className="block w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:opacity-90"
          >
            Ver planos e assinar
          </Link>

          <Link
            href="/"
            className="block w-full border border-gray-300 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Voltar para o início
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          PecuariaTech · Plataforma SaaS de gestão pecuária
        </p>
      </div>
    </main>
  );
}
