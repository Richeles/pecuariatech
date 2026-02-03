import Sidebar from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">

      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 text-[15px] leading-relaxed">
        {children}
      </main>

    </div>
  );
}
