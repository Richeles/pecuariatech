// app/dashboard/layout.tsx
// DASHBOARD HUB — Centro de Comando do PecuariaTech
// Next.js 16 | App Router | Server Component

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* MENU LATERAL ESQUERDO (HUB) */}
      <aside className="w-64 bg-green-700 text-white flex flex-col">
        {/* LOGO */}
        <div className="px-6 py-5 border-b border-green-600">
          <h1 className="text-xl font-bold tracking-wide">
            PecuariaTech
          </h1>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
          <Link
            href="/dashboard"
            className="block rounded px-3 py-2 hover:bg-green-600"
          >
            Visão Geral
          </Link>

          <Link
            href="/dashboard/financeiro"
            className="block rounded px-3 py-2 hover:bg-green-600"
          >
            Financeiro
          </Link>

          <Link
            href="/dashboard/rebanho"
            className="block rounded px-3 py-2 hover:bg-green-600"
          >
            Rebanho
          </Link>

          <Link
            href="/dashboard/pastagem"
            className="block rounded px-3 py-2 hover:bg-green-600"
          >
            Pastagem
          </Link>

          <Link
            href="/planos"
            className="block rounded px-3 py-2 hover:bg-green-600"
          >
            Planos
          </Link>

          <Link
            href="/planos"
            className="mt-4 block text-center bg-green-500 rounded px-3 py-2 font-semibold hover:bg-green-400"
          >
            Assinar
          </Link>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        {/* TOPO CENTRAL */}
        <header className="bg-white border-b px-8 py-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            PecuariaTech
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestão inteligente para decisões reais e crescimento sustentável
          </p>
        </header>

        {/* CONTEÚDO DINÂMICO */}
        <main className="flex-1 px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
