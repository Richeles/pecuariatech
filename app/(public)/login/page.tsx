// =========================================================
// PecuariaTech
// Public Login Page
// Next.js 16 App Router
// SSR SAFE + Suspense SAFE
// =========================================================

import { Suspense } from "react";

import LoginClient from "./LoginClient";

import LanguageSwitcher from "@/app/components/i18n/LanguageSwitcher";

import { getLangFromServer } from "@/app/lib/i18n-server";

import { t } from "@/app/lib/i18n";

// =========================================================
// NEXT 16
// SSR DINÂMICO
// =========================================================

export const dynamic = "force-dynamic";

// =========================================================
// PAGE
// =========================================================

export default async function PublicLoginPage() {

  // =======================================================
  // SSR LANG
  // =======================================================

  const lang =
    await getLangFromServer();

  // =======================================================
  // UI
  // =======================================================

  return (

    <main
      className="
        relative
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        overflow-hidden
        px-4
      "
    >

      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
        "
        style={{
          backgroundImage:
            "url('/pecuariatech.png')",
        }}
      />

      <div
        className="
          absolute
          inset-0
          bg-black/50
          backdrop-blur-[2px]
        "
      />

      {/* ===================================================
          LANGUAGE
      =================================================== */}

      <div
        className="
          absolute
          right-4
          top-4
          z-20
        "
      >
        <LanguageSwitcher />
      </div>

      {/* ===================================================
          CARD
      =================================================== */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-md
        "
      >

        <div
          className="
            rounded-3xl
            border
            border-white/20
            bg-white/95
            p-8
            shadow-2xl
            backdrop-blur
          "
        >

          {/* ===============================================
              HEADER
          =============================================== */}

          <div
            className="
              mb-8
              text-center
            "
          >

            <h1
              className="
                text-3xl
                font-black
                tracking-tight
                text-green-700
              "
            >
              {t(lang, "dashboard.titulo")}
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-neutral-600
              "
            >
              {t(lang, "dashboard.subtitulo")}
            </p>

          </div>

          {/* ===============================================
              LOGIN CLIENT
          =============================================== */}

          <Suspense
            fallback={

              <div
                className="
                  flex
                  items-center
                  justify-center
                  py-10
                "
              >

                <div
                  className="
                    h-10
                    w-10
                    animate-spin
                    rounded-full
                    border-4
                    border-green-600
                    border-t-transparent
                  "
                />

              </div>
            }
          >

            <LoginClient />

          </Suspense>

        </div>

      </div>

    </main>
  );
}