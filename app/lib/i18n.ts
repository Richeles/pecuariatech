// app/lib/i18n.ts

// ===============================
// 🌍 TIPOS
// ===============================
export type Lang = "pt" | "es" | "en";

// ===============================
// 🌍 CLIENT (GLOBAL READY)
// ===============================
export function getLangFromClient(): Lang {
  if (typeof window === "undefined") return "pt";

  // 1️⃣ prioridade: escolha manual
  const saved = localStorage.getItem("lang");
  if (saved === "pt" || saved === "es" || saved === "en") {
    return saved;
  }

  // 2️⃣ navegador
  const browser = navigator.language.toLowerCase();

  if (browser.startsWith("es")) return "es";
  if (browser.startsWith("en")) return "en";

  // 3️⃣ default
  return "pt";
}

// ===============================
// 🌍 SET (FIX BUILD ERROR)
// ===============================
export function setLangClient(lang: Lang) {
  if (typeof window === "undefined") return;

  localStorage.setItem("lang", lang);
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

    bloqueado_msg: "Seu acesso está bloqueado. Escolha um plano",
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

    bloqueado_msg: "Acceso bloqueado. Elige un plan",
  },

  en: {
    email: "Email",
    password: "Password",
    enter: "Sign in",
    create_account: "Create account",
    forgot_password: "Forgot password",

    planos_titulo: "Plans",
    planos_subtitulo: "Choose the best plan",

    mensal: "Monthly",
    trimestral: "Quarterly",
    anual: "Yearly",

    assinar: "Subscribe",
    processando: "Processing...",

    bloqueado_msg: "Access blocked. Choose a plan",
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
function fallbackNeutral(): string {
  return "";
}

// ===============================
// 🧠 FUNÇÃO PRINCIPAL
// ===============================
export function t(lang: Lang, key: string): string {
  const safeLang: Lang = lang in dictionary ? lang : "pt";

  const value = getNested(dictionary[safeLang], key);

  if (typeof value === "string") return value;

  // log apenas uma vez por chave
  if (!missing.has(key)) {
    missing.add(key);

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n missing] ${key} (${safeLang})`);
    }
  }

  // 🔒 REGRA Z
  return fallbackNeutral();
}