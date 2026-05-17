"use client";

import { useEffect, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  pt: string;
  es?: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function T({
  pt,
  es,
}: Props) {

  const [lang, setLang] =
    useState("pt");

  useEffect(() => {

    const stored =
      localStorage.getItem("pecuariatech_lang");

    if (stored) {
      setLang(stored);
    }

    const handle =
      () => {

        const updated =
          localStorage.getItem(
            "pecuariatech_lang"
          );

        if (updated) {
          setLang(updated);
        }
      };

    window.addEventListener(
      "languageChanged",
      handle
    );

    return () => {

      window.removeEventListener(
        "languageChanged",
        handle
      );
    };

  }, []);

  if (
    lang === "es" &&
    es
  ) {
    return <>{es}</>;
  }

  return <>{pt}</>;
}