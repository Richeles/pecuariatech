// app/lib/i18n-server.ts
// PecuariaTech Runtime
// SSR Language Runtime
// Next.js 16 Canonical Runtime
// PT-BR + ES-ES ONLY
// Equação X
// Equação Y
// Regra Z

import {
  cookies,
} from "next/headers";

/* =====================================================
   TYPES
===================================================== */

export type Lang =
  | "pt"
  | "es";

/* =====================================================
   DEFAULT
===================================================== */

const DEFAULT_LANG:
  Lang = "pt";

/* =====================================================
   VALIDATE
===================================================== */

function isValidLang(
  value?: string | null
): value is Lang {

  return (

    value === "pt" ||

    value === "es"
  );
}

/* =====================================================
   GET LANG FROM SERVER
===================================================== */

export async function getLangFromServer():
  Promise<Lang> {

  try {

    const cookieStore =
      await cookies();

    /* ==========================================
       COOKIE CANÔNICO
    ========================================== */

    const lang =
      cookieStore
        .get("lang")
        ?.value;

    if (
      isValidLang(lang)
    ) {

      return lang;
    }

    /* ==========================================
       COMPATIBILIDADE LEGADA
    ========================================== */

    const nextLocale =
      cookieStore
        .get("NEXT_LOCALE")
        ?.value;

    if (
      isValidLang(nextLocale)
    ) {

      return nextLocale;
    }

    /* ==========================================
       DEFAULT
    ========================================== */

    return DEFAULT_LANG;

  } catch (
    error
  ) {

    console.error(
      "[I18N_SERVER]",
      error
    );

    return DEFAULT_LANG;
  }
}