"use client";

// =========================================================
// PECUARIATECH
// LANGUAGE SWITCHER PREMIUM
// I18N RUNTIME
// =========================================================

import { useRouter } from "next/navigation";

export default function LanguageSwitcher() {

  const router =
    useRouter();

  /* =====================================================
     CHANGE LANGUAGE
  ===================================================== */

  function changeLanguage(
    locale: "pt" | "es"
  ) {

    // COOKIE GLOBAL

    document.cookie =
      `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;

    // PATHNAME

    const currentPath =
      window.location.pathname;

    // REMOVE PREFIXO ATUAL

    const cleanPath =
      currentPath
        .replace(/^\/pt/, "")
        .replace(/^\/es/, "");

    // NOVA ROTA

    const nextPath =
      locale === "pt"
        ? `/pt${cleanPath}`
        : `/es${cleanPath}`;

    // REDIRECT PREMIUM

    router.push(nextPath);

    router.refresh();
  }

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div
      className="
        flex
        items-center
        gap-2
        rounded-2xl
        border
        border-white/20
        bg-white/90
        px-3
        py-2
        shadow-lg
        backdrop-blur-xl
      "
    >

      {/* PT */}

      <button
        onClick={() =>
          changeLanguage("pt")
        }
        className="
          rounded-xl
          px-3
          py-1
          text-sm
          font-bold
          text-neutral-700
          transition
          hover:bg-neutral-100
        "
      >
        🇧🇷 PT
      </button>

      {/* ES */}

      <button
        onClick={() =>
          changeLanguage("es")
        }
        className="
          rounded-xl
          px-3
          py-1
          text-sm
          font-bold
          text-neutral-700
          transition
          hover:bg-neutral-100
        "
      >
        🇪🇸 ES
      </button>

    </div>
  );
}