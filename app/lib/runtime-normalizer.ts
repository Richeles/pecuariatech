// app/lib/runtime-normalizer.ts

// ======================================================
// API RESPONSE
// ======================================================

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: any;
  error?: string | null;
};

// ======================================================
// HELPERS
// ======================================================

function toNumber(value: any, fallback = 0) {
  if (value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed)
    ? fallback
    : parsed;
}

function toString(value: any, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function toArray<T>(value: any): T[] {
  return Array.isArray(value)
    ? value
    : [];
}

// ======================================================
// FINANCEIRO
// ======================================================

export function normalizeFinanceiro(raw: any) {
  return {
    receita: toNumber(
      raw?.receita ??
      raw?.kpi_receita ??
      raw?.total_receita
    ),

    despesas: toNumber(
      raw?.despesas ??
      raw?.kpi_despesas ??
      raw?.total_despesas
    ),

    lucro: toNumber(
      raw?.lucro ??
      raw?.resultado
    ),

    margem: toNumber(
      raw?.margem ??
      raw?.margem_percentual
    ),
  };
}

// ======================================================
// REBANHO
// ======================================================

export function normalizeRebanho(raw: any[]) {
  return toArray<any>(raw).map((animal) => ({
    id: toString(
      animal?.id ??
      animal?.animal_id
    ),

    brinco: toString(
      animal?.brinco ??
      animal?.codigo,
      "N/A"
    ),

    peso: toNumber(
      animal?.peso ??
      animal?.peso_atual
    ),

    status: toString(
      animal?.status,
      "ativo"
    ),
  }));
}

// ======================================================
// PASTAGEM
// ======================================================

export function normalizePastagem(raw: any) {
  return {
    hectares: toNumber(
      raw?.hectares ??
      raw?.area_total
    ),

    ocupacao: toNumber(
      raw?.ocupacao ??
      raw?.taxa_ocupacao
    ),

    risco: toString(
      raw?.risco ??
      raw?.risco_status,
      "NORMAL"
    ),

    selo: toString(
      raw?.selo ??
      raw?.selo_verde_status,
      "ANALISANDO"
    ),
  };
}

// ======================================================
// ENGORDA
// ======================================================

export function normalizeEngorda(raw: any[]) {
  return toArray<any>(raw).map((item) => ({
    lote: toString(
      item?.lote ??
      item?.nome_lote,
      "N/A"
    ),

    gmd: toNumber(
      item?.gmd ??
      item?.ganho_medio
    ),

    peso: toNumber(
      item?.peso ??
      item?.peso_medio
    ),

    dias: toNumber(
      item?.dias ??
      item?.dias_confinamento
    ),
  }));
}

// ======================================================
// API RESPONSE
// ======================================================

export function normalizeApiResponse<T>(
  data: T,
  error?: string | null
): ApiResponse<T> {
  return {
    success: !error,

    data,

    meta: {
      normalized: true,
      timestamp: new Date().toISOString(),
    },

    error: error ?? null,
  };
}

// ======================================================
// I18N
// ======================================================

const ALLOWED_LOCALES = [
  "pt",
  "es",
] as const;

export type AppLocale =
  typeof ALLOWED_LOCALES[number];

export function normalizeLocale(
  locale?: string | null
): AppLocale {
  if (!locale) {
    return "pt";
  }

  const normalized =
    locale.toLowerCase().trim();

  return ALLOWED_LOCALES.includes(
    normalized as AppLocale
  )
    ? (normalized as AppLocale)
    : "pt";
}

export function getRuntimeLocale() {
  if (typeof window === "undefined") {
    return "pt";
  }

  const locale =
    localStorage.getItem(
      "pecuariatech:locale"
    );

  return normalizeLocale(locale);
}

export function setRuntimeLocale(
  locale: string
) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized =
    normalizeLocale(locale);

  localStorage.setItem(
    "pecuariatech:locale",
    normalized
  );

  document.cookie =
    `locale=${normalized}; path=/; max-age=31536000`;
}

// ======================================================
// TRANSLATION
// ======================================================

export function t(
  dictionary: Record<string, string>,
  key: string,
  fallback?: string
) {
  return (
    dictionary?.[key] ??
    fallback ??
    key
  );
}