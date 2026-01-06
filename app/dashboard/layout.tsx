// app/dashboard/layout.tsx
// Layout FINAL do Dashboard — PecuariaTech
// Next.js App Router | Produção

import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "PecuariaTech | Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-neutral-100">
      {/* SIDEBAR — AUTORIDADE DO DASHBOARD */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f2a1d] text-white z-40">
        <Sidebar />
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="ml-64 flex-1 relative">
        {/* BACKGROUND RURAL (LEVE, PROFISSIONAL) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/bg-rural.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />

        {/* OVERLAY PARA LEGIBILIDADE */}
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />

        {/* CONTEÚDO */}
        <div className="relative z-10 min-h-screen p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
