import { DashboardProvider } from "@/app/dashboard/DashboardContext";
import Sidebar from "@/app/dashboard/components/Sidebar";
import LanguageSwitcher from "@/app/components/i18n/LanguageSwitcher";
import { ReactNode } from "react";

export const dynamic = 'force-dynamic';   // ← ADICIONE ESTA LINHA

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { lang } = await params;
  const safeLang = lang === "es" ? "es" : "pt";
  const userId = "96a1a441-c0f6-43b2-9cb7-4fadc17fd261";

  return (
    <DashboardProvider userId={userId}>
      <div className="flex min-h-screen bg-[#0F2A1A]">
        <Sidebar lang={safeLang} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}