import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "PecuariaTech",
  description: "Gestão inteligente para pecuária moderna",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-cover bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/fundo-boi.jpg')" }}>

        {/* NAVBAR PRINCIPAL */}
        <nav className="w-full bg-green-800 bg-opacity-80 text-white shadow-lg px-6 py-4 flex justify-between items-center">

          {/* LOGO */}
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            🐂 PecuariaTech
          </Link>

          {/* MENU */}
          <div className="flex gap-6 items-center text-lg font-medium">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/financeiro">Financeiro</Link>
            <Link href="/rebanho">Rebanho</Link>
            <Link href="/pastagem">Pastagem</Link>
            <Link href="/planos">Planos</Link>

            {/* BOTÃO ASSINAR PREMIUM */}
            <a
              href="/planos"
              className="relative inline-flex items-center px-5 py-2 font-bold text-white 
                         bg-green-600 rounded-xl shadow-lg overflow-hidden group 
                         hover:bg-green-700 transition-all"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r 
                               from-green-400 via-green-500 to-green-600 opacity-0 
                               group-hover:opacity-100 transition-opacity">
              </span>

              <span className="relative flex items-center gap-2">
                🚀 Assinar
              </span>
            </a>
          </div>
        </nav>

        {/* CONTEÚDO DAS PÁGINAS */}
        <main className="p-4 md:p-8">
          {children}
        </main>

      </body>
    </html>
  );
}
