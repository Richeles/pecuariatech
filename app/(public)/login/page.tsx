// =========================================================
// PecuariaTech
// Public Login Page
// Next.js 16 App Router
// SSR SAFE + Suspense SAFE
// =========================================================

import Link from "next/link";
import { Suspense } from "react";

import LoginClient from "./LoginClient";

import LanguageSwitcher from "@/app/components/i18n/LanguageSwitcher";

import {
  getLangFromServer,
} from "@/app/lib/i18n-server";

import { t } from "@/app/lib/i18n";

// =========================================================
// NEXT 16
// SSR DINÂMICO
// =========================================================

export const dynamic =
  "force-dynamic";

// =========================================================
// PAGE
// =========================================================

export default async function PublicLoginPage() {

  const lang =
    await getLangFromServer();

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
          bg-no-repeat
        "
        style={{
          backgroundImage:
            "url('/pecuariatech.png')",
        }}
      />

      {/* OVERLAY LEVE */}

      <div
        className="
          absolute
          inset-0
          bg-black/[0.03]
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
            border-white/30
            bg-white/92
            p-8
            shadow-[0_20px_60px_rgba(0,0,0,0.35)]
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

          {/* ===============================================
              ACTIONS
          =============================================== */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
            "
          >

            <Link
              href="/cadastro"
              className="
                flex
                items-center
                justify-center
                rounded-2xl
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                text-sm
                font-bold
                text-green-700
                transition-all
                hover:bg-green-100
              "
            >
              Criar Conta
            </Link>

            <Link
              href={`/${lang}/planos`}
              className="
                flex
                items-center
                justify-center
                rounded-2xl
                border
                border-neutral-200
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-neutral-700
                transition-all
                hover:bg-neutral-100
              "
            >
              Ver Planos
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}