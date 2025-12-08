import "./globals.css";
import StatusOverlay from "./components/StatusOverlay";

export const metadata = {
  title: "PecuariaTech",
  description: "Gestão inteligente para pecuária",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen text-gray-900">

        {/* Inteligência visual sobre o fundo */}
        <StatusOverlay />

        {/* Cabeçalho */}
        <header className="w-full bg-green-700 text-white px-6 py-4 shadow">
          <h1 className="text-2xl font-bold">🐂 PecuariaTech</h1>

          <nav className="mt-2 flex gap-4 text-sm">
            <a href="/" className="hover:underline">🏠 Portal</a>
            <a href="/dashboard" className="hover:underline">📊 Dashboard</a>
            <a href="/financeiro" className="hover:underline">💰 Financeiro</a>
            <a href="/rebanho" className="hover:underline">🐄 Rebanho</a>
            <a href="/pastagem" className="hover:underline">🌾 Pastagem</a>
          </nav>
        </header>

        {/* Conteúdo */}
        <main className="page-container">{children}</main>

      </body>
    </html>
  );
}
