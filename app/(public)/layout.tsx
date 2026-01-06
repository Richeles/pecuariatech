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
          <div className="font-bold text-lg">
            PecuariaTech
          </div>

          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/financeiro" className="hover:underline">
              Financeiro
            </Link>
            <Link href="/rebanho" className="hover:underline">
              Rebanho
            </Link>
            <Link href="/pastagem" className="hover:underline">
              Pastagem
            </Link>
            <Link href="/planos" className="hover:underline">
              Planos
            </Link>
            <Link
              href="/planos"
              className="bg-green-500 px-3 py-1 rounded hover:opacity-90"
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
