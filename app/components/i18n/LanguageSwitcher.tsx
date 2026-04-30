"use client";

import { setLangClient, getLangFromClient } from "@/app/lib/i18n";
import { useEffect, useState } from "react";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  return (
    <select
      value={lang}
      onChange={(e) => {
        setLangClient(e.target.value as any);
      }}
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        padding: 6,
        borderRadius: 8,
      }}
    >
      <option value="pt">PT</option>
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  );
}