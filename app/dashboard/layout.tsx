import Sidebar from "./components/Sidebar";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { getLangFromServer } from "../lib/i18n-server";
import { t } from "../lib/i18n";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLangFromServer();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">

      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">

          <div>
            <h1 className="text-lg font-semibold">
              {t(lang, "dashboard.titulo")}
            </h1>
            <p className="text-xs text-gray-500">
              {t(lang, "dashboard.subtitulo")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 text-[15px] leading-relaxed">
          {children}
        </main>

      </div>
    </div>
  );
}