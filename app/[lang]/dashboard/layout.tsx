import Sidebar from "@/app/dashboard/components/Sidebar";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { t } from "@/app/lib/i18n";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: "pt" | "es" }>;
}) {

  const { lang } = await params;

  return (
    <div className="flex min-h-screen bg-[#edf2ee]">

      {/* SIDEBAR */}
      <Sidebar lang={lang} />

      {/* CONTEÚDO */}
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

          {/* TITULO */}
          <div>

            <h1 className="text-3xl font-black text-[#173222]">
              PecuariaTech
            </h1>

            <p className="mt-1 text-sm text-[#4f6d58]">
              {t(lang, "dashboard_subtitulo")}
            </p>

          </div>

          {/* SWITCH */}
          <LanguageSwitcher />

        </header>

        {/* MAIN */}
        <main className="flex-1">
          {children}
        </main>

      </div>

    </div>
  );
}