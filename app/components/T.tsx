"use client";

import { useEffect, useState } from "react";
import { getLangFromClient, t } from "@/app/lib/i18n";

type Lang = "pt" | "es";

export default function T({ k }: { k: string }) {
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  // 🔥 GARANTIA: sempre retorna string
  let value: any;

  try {
    value = t(lang, k as any);
  } catch {
    value = k;
  }

  // 🚨 BLOQUEIO CRÍTICO
  if (typeof value !== "string") {
    return <>{k}</>;
  }

  return <>{value}</>;
}