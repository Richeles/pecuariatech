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

    /* ==========================================
       NEXT 16
    ========================================== */

    const cookieStore =
      await cookies();

    /* ==========================================
       LANG COOKIE
    ========================================== */

    const lang =
      cookieStore
        .get(
          "lang"
        )
        ?.value;

    /* ==========================================
       VALIDATION
    ========================================== */

    if (
      isValidLang(
        lang
      )
    ) {

      return lang;
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

    /* ==========================================
       FAIL SAFE
    ========================================== */

    return DEFAULT_LANG;
  }
}