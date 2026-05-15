"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang =
  | "pt"
  | "es";

type LanguageContextType = {
  lang: Lang;
  setLang: (
    lang: Lang
  ) => void;
};

const LanguageContext =
  createContext<
    LanguageContextType | undefined
  >(undefined);

/* =====================================================
   STORAGE KEY
===================================================== */

const STORAGE_KEY =
  "pecuariatech_lang";

/* =====================================================
   PROVIDER
===================================================== */

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [lang, setLangState] =
    useState<Lang>("pt");

  /* ===================================================
     INIT
  =================================================== */

  useEffect(() => {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        ) as Lang | null;

      if (
        saved === "pt"
        ||
        saved === "es"
      ) {

        setLangState(saved);

        return;
      }

      setLangState("pt");

    } catch {

      setLangState("pt");
    }

  }, []);

  /* ===================================================
     SET LANG
  =================================================== */

  function setLang(
    nextLang: Lang
  ) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        nextLang
      );

    } catch {}

    setLangState(nextLang);
  }

  /* ===================================================
     MEMO
  =================================================== */

  const value =
    useMemo(
      () => ({
        lang,
        setLang,
      }),
      [lang]
    );

  /* ===================================================
     PROVIDER
  =================================================== */

  return (

    <LanguageContext.Provider
      value={value}
    >

      {children}

    </LanguageContext.Provider>
  );
}

/* =====================================================
   HOOK
===================================================== */

export function useLanguage() {

  const context =
    useContext(
      LanguageContext
    );

  if (!context) {

    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}