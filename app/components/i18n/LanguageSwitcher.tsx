"use client";

// =========================================================
// PecuariaTech
// Language Switcher Premium Runtime
// PT + ES + Runtime Sync
// =========================================================

import {
  useEffect,
  useState,
} from "react";

import {
  useLanguage,
  type Lang,
} from "@/app/providers/LanguageProvider";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY =
  "pecuariatech_lang";

/* =========================================================
   COMPONENT
========================================================= */

export default function LanguageSwitcher() {

  const {
    lang,
    setLang,
  } = useLanguage();

  const [
    mounted,
    setMounted,
  ] = useState(false);

  /* =====================================================
     HYDRATION SAFE
  ===================================================== */

  useEffect(() => {

    setMounted(true);

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      ) as Lang | null;

    if (
      saved &&
      saved !== lang
    ) {

      setLang(saved);
    }

  }, [
    lang,
    setLang,
  ]);

  /* =====================================================
     CHANGE LANGUAGE
  ===================================================== */

  function handleChange(
    value: Lang
  ) {

    // localStorage
    localStorage.setItem(
      STORAGE_KEY,
      value
    );

    // runtime provider
    setLang(value);

    // runtime event
    window.dispatchEvent(
      new Event(
        "languageChanged"
      )
    );
  }

  /* =====================================================
     HYDRATION
  ===================================================== */

  if (!mounted) {

    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div
      className="
        flex
        items-center
      "
    >

      <select
        value={lang}
        onChange={(e) =>
          handleChange(
            e.target.value as Lang
          )
        }
        className="
          rounded-xl
          border
          border-emerald-200
          bg-white
          px-3
          py-2
          text-sm
          font-bold
          text-gray-700
          shadow-sm
          outline-none
          transition-all
          hover:border-emerald-400
          focus:border-emerald-500
        "
      >

        <option value="pt">
          🇧🇷 PT
        </option>

        <option value="es">
          🇪🇸 ES
        </option>

      </select>

    </div>
  );
}