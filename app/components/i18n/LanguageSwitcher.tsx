"use client";

import { getLangFromClient } from "@/app/lib/i18n";
import { useEffect, useState } from "react";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  const handleChange = (value: string) => {
    localStorage.setItem("lang", value);
    setLang(value);

    // força recarregar para aplicar idioma
    window.location.reload();
  };

  return (
    <select
      value={lang}
      onChange={(e) => handleChange(e.target.value)}
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