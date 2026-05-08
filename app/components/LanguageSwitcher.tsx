"use client";

import { usePathname, useRouter } from "next/navigation";

type Lang = "pt" | "es";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // idioma atual
  const currentLang: Lang =
    pathname.startsWith("/es")
      ? "es"
      : "pt";

  async function changeLanguage(lang: Lang) {
    if (lang === currentLang) return;

    const segments = pathname.split("/").filter(Boolean);

    // remove locale atual
    if (segments[0] === "pt" || segments[0] === "es") {
      segments.shift();
    }

    // mantém rota atual
    const cleanPath = segments.join("/");

    const newPath = cleanPath
      ? `/${lang}/${cleanPath}`
      : `/${lang}`;

    // sincroniza cookie SSR
    await fetch("/api/lang", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lang }),
    });

    // navegação SPA
    router.push(newPath);

    // sincroniza SSR
    router.refresh();
  }

  return (
    <div
      className="
        flex items-center gap-1
        rounded-full
        border border-neutral-200
        bg-white/95
        px-1 py-1
        shadow-xl
        backdrop-blur-md
      "
    >
      {/* PT */}
      <button
        onClick={() => changeLanguage("pt")}
        className={`
          rounded-full
          px-3 py-1.5
          text-xs font-semibold
          tracking-wide
          transition-all duration-200
          ${
            currentLang === "pt"
              ? "bg-green-600 text-white shadow-md"
              : "text-neutral-600 hover:bg-neutral-100"
          }
        `}
      >
        🇧🇷 PT
      </button>

      {/* ES */}
      <button
        onClick={() => changeLanguage("es")}
        className={`
          rounded-full
          px-3 py-1.5
          text-xs font-semibold
          tracking-wide
          transition-all duration-200
          ${
            currentLang === "es"
              ? "bg-green-600 text-white shadow-md"
              : "text-neutral-600 hover:bg-neutral-100"
          }
        `}
      >
        🇪🇸 ES
      </button>
    </div>
  );
}