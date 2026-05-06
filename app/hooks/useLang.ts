"use client";

import { useEffect, useState } from "react";
import { Lang } from "@/app/lib/i18n";

export function useLang() {
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    const cookieLang =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("lang="))
        ?.split("=")[1] || "pt";

    setLang(cookieLang as Lang);
  }, []);

  return lang;
}