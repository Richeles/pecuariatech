// app/[lang]/dashboard/layout.tsx
// PecuariaTech Dashboard Layout
// Next.js 16 + SSR + Multilanguage

import Sidebar from "@/app/dashboard/components/Sidebar";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { t } from "@/app/lib/i18n";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;

  params: Promise<{
    lang: string;
  }>;
}) {
  // ======================================
  // NEXT 16 PARAMS
  // ======================================

  const { lang } = await params;

  // ======================================
  // NORMALIZAÇÃO
  // ======================================

  const safeLang =
    lang === "es"
      ? "es"
      : "pt";

  // ======================================
  // LAYOUT
  // ======================================

  return (
    <div className="flex min-h-screen bg-[#edf2ee]">

      {/* SIDEBAR */}
      <Sidebar lang={safeLang} />

      {/* CONTENT */}
      <div className="flex flex-1 flex-col">

        {/* HEADER */}
        <header
          className="
            sticky top-0 z-40
            flex items-center justify-between
            border-b border-[#d7e5da]
            bg-white/95
            px-8 py-5
            backdrop-blur-xl
          "
        >
          {/* TITLES */}
          <div>

            <h1 className="text-3xl font-black text-[#173222] tracking-tight">
              PecuariaTech
            </h1>

            <p className="mt-1 text-sm text-[#4f6d58]">
              {t(
                safeLang,
                "Gestão Inteligente"
              )}
            </p>

          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">

            <LanguageSwitcher />

          </div>

        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}