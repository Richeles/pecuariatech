"use client";

import { useEffect, useState } from "react";

type Lang = "pt" | "es";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>("pt");

  // 🔹 sincroniza idioma ao carregar
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "es") setLang("es");
    else setLang("pt");
  }, []);

  async function changeLang(newLang: Lang) {
    try {
      // 🔹 local (rápido)
      localStorage.setItem("lang", newLang);
      setLang(newLang);

      // 🔹 server (cookie SSR)
      await fetch("/api/lang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lang: newLang }),
      });
    } catch {
      // 🔒 Regra Z → nunca quebrar UX
    }

    // 🔹 força re-render SSR
    window.location.reload();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {/* 🔹 Label profissional */}
      <span className="text-xs text-gray-500 font-medium">
        Idioma
      </span>

      {/* 🔹 Toggle SaaS */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => changeLang("pt")}
          className={`px-3 py-1 rounded-lg text-sm transition ${
            lang === "pt"
              ? "bg-white shadow font-semibold"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          🇧🇷 Português
        </button>

        <button
          onClick={() => changeLang("es")}
          className={`px-3 py-1 rounded-lg text-sm transition ${
            lang === "es"
              ? "bg-white shadow font-semibold"
              : "opacity-60 hover:opacity-100"
          }`}
        >
          🇪🇸 Español
        </button>
      </div>
    </div>
  );
}