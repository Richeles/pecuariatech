// app/(public)/login/page.tsx
// Página pública de login — arquitetura canônica PecuariaTech + i18n global

import LoginClient from "./LoginClient";
import LanguageSwitcher from "@/app/components/i18n/LanguageSwitcher";

// 🔥 CORREÇÃO: importar do server
import { getLangFromServer } from "@/app/lib/i18n-server";

// 🔥 mantém t no core
import { t } from "@/app/lib/i18n";

export default async function PublicLoginPage() {
  // 🔥 SSR correto (Next 16)
  const lang = await getLangFromServer();

  return (
    <main
      className="relative w-full flex justify-center px-4"
      style={{ minHeight: "100vh" }}
    >
      {/* 🌍 Seletor de idioma (GLOBAL) */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/pecuariatech.png')" }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Cabeçalho */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-700">
              {t(lang, "dashboard.titulo")}
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              {t(lang, "dashboard.subtitulo")}
            </p>
          </div>

          {/* Formulário */}
          <LoginClient />

        </div>
      </div>
    </main>
  );
}