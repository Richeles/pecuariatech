import pt from "@/app/i18n/pt.json";
import es from "@/app/i18n/es.json";

type Lang = "pt" | "es";

export function getDictionary(lang: Lang) {
  return lang === "es" ? es : pt;
}

// 🌍 CLIENT
export function getLangFromClient(): Lang {
  if (typeof window === "undefined") return "pt";

  const saved = localStorage.getItem("lang") as Lang | null;

  if (saved === "es" || saved === "pt") return saved;

  return navigator.language.startsWith("es") ? "es" : "pt";
}

export function setLangClient(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem("lang", lang);
}

// 🌍 SERVER (SSR)
export async function getLangServer(): Promise<Lang> {
  return "pt"; // simples e seguro (não quebra SSR)
}

// 🌍 TRANSLATE
export function t(lang: Lang, key: string) {
  const dict = getDictionary(lang);
  return (dict as any)[key] || key;
}