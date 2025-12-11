import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "PecuariaTech",
  description: "Gestão inteligente para fazendas modernas",
};

// π-design aplicado em proporções e bordas
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="bg-[#eef5ee] text-gray-900 antialiased">

        {/* NAVBAR FIXA — π-design aplicado */}
        <header className="w-full bg-[#2f7a43] shadow-lg shadow-black/20 fixed top-0 left-0 z-50 rounded-b-3xl">
          <nav className="max-w-7xl mx-auto flex justify-between items-center px-8 h-16">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl drop-shadow-sm">🐂</span>
              <span className="text-white text-2xl font-bold drop-shadow">
                PecuariaTech
              </span>
            </Link>

            {/* MENU — proporções baseadas em π */}
            <div className="flex items-center gap-6 text-white text-lg font-semibold">

              <Link href="/dashboard" className="hover:text-green-300 transition-all duration-300">
                Dashboard
              </Link>

              <Link href="/financeiro" className="hover:text-green-300 transition-all duration-300">
                Financeiro
              </Link>

              <Link href="/rebanho" className="hover:text-green-300 transition-all duration-300">
                Rebanho
              </Link>

              <Link href="/pastagem" className="hover:text-green-300 transition-all duration-300">
                Pastagem
              </Link>

              <Link href="/planos" className="hover:text-green-300 transition-all duration-300">
                Planos
              </Link>

              {/* BOTÃO ASSINAR — raio = π×8 ≈ 24px */}
              <Link
                href="/planos"
                className="bg-green-500 hover:bg-green-600 px-5 py-2 text-white font-bold rounded-3xl shadow-md shadow-black/20 transition-all duration-300"
              >
                Assinar
              </Link>
            </div>
          </nav>
        </header>

        {/* GAP π × 6 (≈ 18) para compensar menu */}
        <div className="h-20"></div>

        {/* CONTEÚDO DAS PÁGINAS */}
        <main className="min-h-screen px-6 py-4">{children}</main>
      </body>
    </html>
  );
}
