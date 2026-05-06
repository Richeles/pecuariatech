"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Lang, getLangFromClient, setLangClient } from "@/app/lib/i18n";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const saved = getLangFromClient();
    setLangState(saved);
  }, []);

  function setLang(lang: Lang) {
    setLangClient(lang);
    setLangState(lang);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}