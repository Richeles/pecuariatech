// CAMINHO: app/dashboard/layout.tsx
// Layout do Dashboard — PecuariaTech
// Estilo: SaaS Premium Rural (Gradiente leve)
// Triângulo 360 aplicado: UX + Produto + Tecnologia

import Sidebar from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f3f7f4] via-[#eef3ef] to-[#e8f0eb]">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTEÚDO */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
