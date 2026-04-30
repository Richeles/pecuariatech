// app/lib/i18n.ts

export type Lang = "pt" | "es";

// ===============================
// 🌍 CLIENT (GLOBAL READY)
// ===============================
export function getLangFromClient(): Lang {
  if (typeof window === "undefined") return "pt";

  // 1️⃣ localStorage (prioridade manual do usuário)
  const saved = localStorage.getItem("lang");
  if (saved === "es") return "es";

  // 2️⃣ navegador (fallback inteligente global)
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith("es")) return "es";

  // 3️⃣ default
  return "pt";
}

// ===============================
// 🧠 DICIONÁRIO (Y)
// ===============================
export const dictionary = {
  pt: {
    email: "E-mail",
    password: "Senha",
    enter: "Entrar",
    create_account: "Criar conta",
    forgot_password: "Esqueci minha senha",

    planos_titulo: "Planos",
    planos_subtitulo: "Escolha o melhor plano",

    mensal: "Mensal",
    trimestral: "Trimestral",
    anual: "Anual",

    assinar: "Assinar",
    processando: "Processando...",

    bloqueado_msg: "Seu acesso está bloqueado. Escolha um plano.",
  },

  es: {
    email: "Correo electrónico",
    password: "Contraseña",
    enter: "Ingresar",
    create_account: "Crear cuenta",
    forgot_password: "Olvidé mi contraseña",

    planos_titulo: "Planes",
    planos_subtitulo: "Elige el mejor plan",

    mensal: "Mensual",
    trimestral: "Trimestral",
    anual: "Anual",

    assinar: "Suscribirse",
    processando: "Procesando...",

    bloqueado_msg: "Acceso bloqueado. Elige un plan.",
  },
} as const;

// ===============================
// 🔍 GET (SAFE)
// ===============================
function getNested(obj: unknown, key: string): unknown {
  if (typeof obj !== "object" || obj === null) return undefined;

  return (obj as Record<string, unknown>)[key];
}

// ===============================
// 🧠 CACHE (Z)
// ===============================
const missing = new Set<string>();

// ===============================
// 🧠 FALLBACK (UX SAFE)
// ===============================
function fallbackNeutral(key: string): string {
  // evita poluir UI com key técnica
  return "";
}

// ===============================
// 🧠 FUNÇÃO PRINCIPAL
// ===============================
export function t(lang: Lang, key: string): string {
  const safeLang: Lang = lang in dictionary ? lang : "pt";

  const value = getNested(dictionary[safeLang], key);

  if (typeof value === "string") return value;

  // log inteligente (1x por chave)
  if (!missing.has(key)) {
    missing.add(key);

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n missing] ${key} (${safeLang})`);
    }
  }

  // 🔒 REGRA Z → nunca quebrar UI
  return fallbackNeutral(key);
}