"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getLangFromClient,
  t,
} from "@/app/lib/i18n";

type Lang =
  | "pt"
  | "es";

export default function T({
  k,
}: {
  k: string;
}) {

  const [
    lang,
    setLang,
  ] =
    useState<Lang>(
      "pt"
    );

  /* ==========================================
     CLIENT LOCALE
  ========================================== */

  useEffect(() => {

    const current =
      getLangFromClient();

    if (
      current === "es"
    ) {

      setLang("es");

    } else {

      setLang("pt");

    }

  }, []);

  /* ==========================================
     TRANSLATION
  ========================================== */

  let value: any;

  try {

    value =
      t(
        lang,
        k as any
      );

  } catch {

    value = k;

  }

  /* ==========================================
     SAFE RETURN
  ========================================== */

  if (
    typeof value !==
    "string"
  ) {

    return <>{k}</>;
  }

  return <>{value}</>;
}