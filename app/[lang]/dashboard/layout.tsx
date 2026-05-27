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

    <div
      className="
        flex
        min-h-screen
        bg-gradient-to-br
        from-[#e7f0ea]
        via-[#edf5ef]
        to-[#dce9e1]
      "
    >

      {/* SIDEBAR */}

      <Sidebar lang={safeLang} />

      {/* CONTENT */}

      <div
        className="
          flex
          flex-1
          flex-col
        "
      >

        {/* HEADER */}

        <header
          className="
            sticky
            top-0
            z-40
            flex
            items-center
            justify-between
            border-b
            border-[#cfe1d5]
            bg-[#f4faf6]/95
            px-8
            py-5
            backdrop-blur-xl
            shadow-[0_2px_12px_rgba(0,0,0,0.04)]
          "
        >

          {/* TITLES */}

          <div>

            <h1
              className="
                text-3xl
                font-black
                tracking-tight
                text-[#173222]
              "
            >
              PecuariaTech
            </h1>

            <p
              className="
                mt-1
                text-sm
                font-medium
                tracking-wide
                text-[#4f6d58]
              "
            >
              Gestão Inteligente
            </p>

          </div>

          {/* ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <LanguageSwitcher />

          </div>

        </header>

        {/* MAIN */}

        <main
          className="
            flex-1
            overflow-y-auto
          "
        >
          {children}
        </main>

      </div>

    </div>
  );
}