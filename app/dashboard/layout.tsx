// app/dashboard/layout.tsx
// DASHBOARD HUB — Centro de Comando do PecuariaTech
// Next.js 16 | App Router | Server Component

import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* MENU LATERAL ESQUERDO (HUB) */}
      <aside className="w-64 bg-green-700 text-white flex flex-col">
        {/* LOGO (imagem + marca) */}
        <div className="px-6 py-5 border-b border-green-600">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded bg-white/10 overflow-hidden border border-white/20">
              <Image
                src="/pecuariatech.png"
                alt="PecuariaTech"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-wide">PecuariaTech</h1>
              <p className="text-[11px] text-white/80">Gestão inteligente no campo</p>
            </div>
          </div>
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

          {/* ✅ ENGORDA (mantido do ajuste anterior) */}
          <Link
            href="/dashboard/engorda"
            className="block rounded px-3 py-2 hover:bg-green-600"
          >
            Engorda
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
          <h2 className="text-2xl font-bold text-gray-800">PecuariaTech</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestão inteligente para decisões reais e crescimento sustentável
          </p>
        </header>

        {/* CONTEÚDO DINÂMICO */}
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
