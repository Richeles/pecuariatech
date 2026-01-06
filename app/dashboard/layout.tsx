// CAMINHO: app/dashboard/layout.tsx
// Layout do Dashboard — PecuariaTech
// Padrão SaaS profissional (Triângulo 360)
// Sidebar à esquerda | Sem topbar | Estável

import Sidebar from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR FIXA */}
      <Sidebar />

      {/* CONTEÚDO DO DASHBOARD */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
