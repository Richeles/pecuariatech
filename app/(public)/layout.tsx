// CAMINHO: app/(public)/layout.tsx
// Layout público — PecuariaTech
// ⚠️ NÃO importar globals.css aqui

import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER PÚBLICO */}
      <header className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Marca */}
          <div className="font-extrabold text-xl tracking-tight">
            PecuariaTech
          </div>

          {/* Menu */}
          <nav className="flex gap-6 text-base font-semibold">
            <Link href="/dashboard" className="hover:underline underline-offset-4">
              Dashboard
            </Link>

            <Link href="/financeiro" className="hover:underline underline-offset-4">
              Financeiro
            </Link>

            <Link href="/rebanho" className="hover:underline underline-offset-4">
              Rebanho
            </Link>

            <Link href="/pastagem" className="hover:underline underline-offset-4">
              Pastagem
            </Link>

            {/* ✅ NOVO: Engorda entre Pastagem e Planos */}
            <Link href="/dashboard/engorda" className="hover:underline underline-offset-4">
              Engorda
            </Link>

            <Link href="/planos" className="hover:underline underline-offset-4">
              Planos
            </Link>

            <Link
              href="/planos"
              className="bg-green-500 px-4 py-2 rounded-lg hover:opacity-90 transition shadow-sm"
            >
              Assinar
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main>{children}</main>
    </div>
  );
}
