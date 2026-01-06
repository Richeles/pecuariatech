// CAMINHO: app/(public)/layout.tsx
// Layout Público — PecuariaTech
// NÃO exibe menu superior no dashboard
// Next.js App Router

import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-pathname") || "";

  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/rebanho") ||
    pathname.startsWith("/pastagem");

  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900">
        {/* HEADER PÚBLICO — NÃO aparece no dashboard */}
        {!isDashboard && (
          <header className="bg-green-800 text-white">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2 font-bold text-lg">
                🐂 PecuariaTech
              </div>

              <nav className="flex gap-4 text-sm font-medium">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/financeiro">Financeiro</Link>
                <Link href="/rebanho">Rebanho</Link>
                <Link href="/pastagem">Pastagem</Link>
                <Link href="/planos">Planos</Link>
                <Link
                  href="/planos"
                  className="bg-green-600 px-4 py-1 rounded hover:opacity-90"
                >
                  Assinar
                </Link>
              </nav>
            </div>
          </header>
        )}

        <main>{children}</main>
      </body>
    </html>
  );
}
