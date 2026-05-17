"use client";

// =========================================================
// PecuariaTech
// Language Switcher Premium
// PT + ES Runtime
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

  }, []);

  /* =====================================================
     CHANGE
  ===================================================== */

  function handleChange(
    value: Lang
  ) {

    localStorage.setItem(
      STORAGE_KEY,
      value
    );

    setLang(value);
  }

  /* =====================================================
     AVOID HYDRATION ERROR
  ===================================================== */

  if (!mounted) {

    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (

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
        font-semibold
        text-gray-700
        shadow-sm
        outline-none
      "
    >

      <option value="pt">
        PT
      </option>

      <option value="es">
        ES
      </option>

    </select>
  );
}