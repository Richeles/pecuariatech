// app/i18n/getDictionary.ts

import pt from "./dictionaries/pt";
import es from "./dictionaries/es";

export async function getDictionary(
  lang: string
) {

  return lang === "es"
    ? es
    : pt;
}