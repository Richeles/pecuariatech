import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* NAVBAR FIXA */}
      <header className="w-full bg-[#2f7a43] shadow-lg shadow-black/20 fixed top-0 left-0 z-50 rounded-b-3xl">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-8 h-16">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🐂</span>
            <span className="text-white text-2xl font-bold">
              PecuariaTech
            </span>
          </Link>

          <div className="flex items-center gap-6 text-white text-lg font-semibold">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/financeiro">Financeiro</Link>
            <Link href="/rebanho">Rebanho</Link>
            <Link href="/pastagem">Pastagem</Link>
            <Link href="/planos">Planos</Link>
            <Link
              href="/planos"
              className="bg-green-500 px-5 py-2 rounded-3xl font-bold"
            >
              Assinar
            </Link>
          </div>
        </nav>
      </header>

      <div className="h-20" />

      <main className="min-h-screen px-6 py-4">
        {children}
      </main>
    </>
  );
}
