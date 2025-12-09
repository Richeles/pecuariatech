import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "PecuariaTech",
  description: "Gestão inteligente para fazendas modernas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#eef5ee] text-gray-900">

        {/* NAVBAR */}
        <header className="w-full bg-[#2f7a43] shadow-lg fixed top-0 left-0 z-50">
          <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/boi.png"
                alt="Logo PecuariaTech"
                className="w-8 h-8 object-contain"
              />
              <span className="text-white text-xl font-extrabold tracking-wide drop-shadow">
                PecuariaTech
              </span>
            </Link>

            {/* MENU */}
            <div className="flex items-center gap-6 text-white text-md font-semibold">
              <Link href="/dashboard" className="hover:text-green-300 transition">
                Dashboard
              </Link>

              <Link href="/financeiro" className="hover:text-green-300 transition">
                Financeiro
              </Link>

              <Link href="/rebanho" className="hover:text-green-300 transition">
                Rebanho
              </Link>

              <Link href="/pastagem" className="hover:text-green-300 transition">
                Pastagem
              </Link>

              <Link href="/planos" className="hover:text-green-300 transition">
                Planos
              </Link>

              {/* BOTÃO ASSINAR */}
              <Link
                href="/planos"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition font-bold"
              >
                Assinar
              </Link>
            </div>
          </nav>
        </header>

        {/* ESPAÇAMENTO POR CAUSA DA NAVBAR FIXA */}
        <div className="h-20"></div>

        {/* CONTEÚDO */}
        <main className="min-h-screen">{children}</main>

      </body>
    </html>
  );
}
