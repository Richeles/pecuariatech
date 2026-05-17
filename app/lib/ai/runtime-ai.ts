// app/lib/ai/runtime-ai.ts
// PecuariaTech Runtime AI Layer
// Equação Y + Runtime Semântico
// IA operacional NÃO mutável
// Apenas suporte semântico/i18n/UX

/* =========================================================
   TYPES
========================================================= */

export type RuntimeLang =
  | "pt"
  | "es"
  | "en";

export type RuntimeAIResponse = {
  success: boolean;

  original: string;

  translated: string;

  sourceLang: RuntimeLang;

  targetLang: RuntimeLang;
};

/* =========================================================
   LANGUAGE DETECTION
========================================================= */

export function detectLanguage(
  text: string
): RuntimeLang {

  const lower =
    text.toLowerCase();

  /* =========================================
     SPANISH
  ========================================= */

  const spanishWords = [
    "hola",
    "gracias",
    "plan",
    "ganadería",
    "gestión",
    "financiero",
    "suscribirse",
    "operacional",
    "inteligencia",
  ];

  const hasSpanish =
    spanishWords.some(
      (word) =>
        lower.includes(word)
    );

  if (hasSpanish) {
    return "es";
  }

  /* =========================================
     ENGLISH
  ========================================= */

  const englishWords = [
    "hello",
    "dashboard",
    "analytics",
    "pricing",
    "runtime",
    "cloud",
    "management",
    "cattle",
  ];

  const hasEnglish =
    englishWords.some(
      (word) =>
        lower.includes(word)
    );

  if (hasEnglish) {
    return "en";
  }

  /* =========================================
     DEFAULT
  ========================================= */

  return "pt";
}

/* =========================================================
   NORMALIZE TEXT
========================================================= */

export function normalizeRuntimeText(
  text: string
): string {

  return text

    /* espaços duplicados */
    .replace(/\s+/g, " ")

    /* remove espaços extremos */
    .trim()

    /* corrige unicode estranho */
    .normalize("NFC")

    /* remove quebra excessiva */
    .replace(/\n{3,}/g, "\n\n");
}

/* =========================================================
   TRANSLATE RUNTIME
========================================================= */

export async function translateRuntime(
  text: string,
  targetLang: RuntimeLang
): Promise<RuntimeAIResponse> {

  const normalized =
    normalizeRuntimeText(
      text
    );

  const sourceLang =
    detectLanguage(
      normalized
    );

  /* =========================================
     NO TRANSLATION NEEDED
  ========================================= */

  if (
    sourceLang === targetLang
  ) {

    return {
      success: true,

      original: text,

      translated: normalized,

      sourceLang,

      targetLang,
    };
  }

  /* =========================================
     MOCK RUNTIME TRANSLATIONS
     FASE 1 IA
  ========================================= */

  let translated =
    normalized;

  /* =========================================
     PT -> ES
  ========================================= */

  if (
    sourceLang === "pt"
    &&
    targetLang === "es"
  ) {

    translated =
      normalized

        .replaceAll(
          "Planos",
          "Planes"
        )

        .replaceAll(
          "Assinar",
          "Suscribirse"
        )

        .replaceAll(
          "Mensal",
          "Mensual"
        )

        .replaceAll(
          "Anual",
          "Anual"
        )

        .replaceAll(
          "Mais escolhido",
          "Más elegido"
        )

        .replaceAll(
          "Controle",
          "Control"
        )

        .replaceAll(
          "Financeiro",
          "Financiero"
        )

        .replaceAll(
          "Dashboard",
          "Dashboard"
        );
  }

  /* =========================================
     ES -> PT
  ========================================= */

  if (
    sourceLang === "es"
    &&
    targetLang === "pt"
  ) {

    translated =
      normalized

        .replaceAll(
          "Planes",
          "Planos"
        )

        .replaceAll(
          "Suscribirse",
          "Assinar"
        )

        .replaceAll(
          "Mensual",
          "Mensal"
        )

        .replaceAll(
          "Más elegido",
          "Mais escolhido"
        )

        .replaceAll(
          "Control",
          "Controle"
        )

        .replaceAll(
          "Financiero",
          "Financeiro"
        );
  }

  /* =========================================
     RETURN
  ========================================= */

  return {
    success: true,

    original: text,

    translated,

    sourceLang,

    targetLang,
  };
}

/* =========================================================
   AI LABEL FIXER
========================================================= */

export function fixRuntimeLabels(
  label: string
): string {

  const normalized =
    normalizeRuntimeText(
      label
    );

  return normalized

    .replaceAll(
      "BR / ES",
      "PT 🇧🇷 / ES 🇪🇸"
    )

    .replaceAll(
      "BR",
      "PT"
    )

    .replaceAll(
      "Español",
      "ES 🇪🇸"
    )

    .replaceAll(
      "Português",
      "PT 🇧🇷"
    );
}

/* =========================================================
   AI HEALTH CHECK
========================================================= */

export function runtimeAIHealth() {

  return {
    runtime: "ok",

    aiLayer: "online",

    translation: "enabled",

    semanticRuntime: "enabled",

    timestamp:
      new Date().toISOString(),
  };
}