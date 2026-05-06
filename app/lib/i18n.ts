// app/lib/i18n.ts

// ===============================
// 🌍 TIPOS
// ===============================
export type Lang = "pt" | "es" | "en";

// ===============================
// 🔒 SAFE COOKIE PARSER
// ===============================
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));

  if (!match) return null;

  const value = match.split("=")[1];

  if (!value) return null;

  return value;
}

// ===============================
// 🌍 CLIENT (PADRÃO FINAL)
// ===============================
export function getLangFromClient(): Lang {
  if (typeof window === "undefined") return "pt";

  // 🔥 PRIORIDADE 1: COOKIE (SSR FIRST)
  const cookieLang = getCookie("lang");

  if (cookieLang === "pt" || cookieLang === "es" || cookieLang === "en") {
    return cookieLang;
  }

  // 🔥 PRIORIDADE 2: LOCAL STORAGE
  const saved = localStorage.getItem("lang");
  if (saved === "pt" || saved === "es" || saved === "en") {
    return saved;
  }

  // 🔥 PRIORIDADE 3: BROWSER
  const browser = navigator.language?.toLowerCase?.() || "";

  if (browser.startsWith("es")) return "es";
  if (browser.startsWith("en")) return "en";

  return "pt";
}

// ===============================
export function setLangClient(lang: Lang) {
  if (typeof window === "undefined") return;

  // 🔥 salva nos dois (cookie + localStorage)
  localStorage.setItem("lang", lang);

  document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

// ===============================
// 🧠 DICIONÁRIO GLOBAL
// ===============================
export const dictionary = {
  pt: {
    login_titulo: "PecuariaTech",
    login_subtitulo: "Centro de controle da fazenda",

    email: "E-mail",
    password: "Senha",
    enter: "Entrar",
    create_account: "Criar conta",
    forgot_password: "Esqueci minha senha",

    planos_titulo: "Planos PecuariaTech",
    planos_subtitulo: "Escolha o melhor plano para sua operação",

    mensal: "Mensal",
    trimestral: "Trimestral",
    anual: "Anual",

    assinar: "Assinar",
    processando: "Processando...",

    bloqueado_msg: "Seu acesso está bloqueado. Escolha um plano",

    dashboard: {
      titulo: "PecuariaTech",
      subtitulo: "Centro de controle da fazenda",
    },

    menu_dashboard: "Dashboard",
    menu_financeiro: "Financeiro",
    menu_rebanho: "Rebanho",
    menu_pastagem: "Pastagem",
    menu_cfo: "CFO Autônomo",
    menu_engorda: "Engorda",
    menu_assinatura: "Planos",
  },

  es: {
    login_titulo: "PecuariaTech",
    login_subtitulo: "Centro de control de la finca",

    email: "Correo electrónico",
    password: "Contraseña",
    enter: "Ingresar",
    create_account: "Crear cuenta",
    forgot_password: "Olvidé mi contraseña",

    planos_titulo: "Planes PecuariaTech",
    planos_subtitulo: "Elige el mejor plan para tu operación",

    mensal: "Mensual",
    trimestral: "Trimestral",
    anual: "Anual",

    assinar: "Suscribirse",
    processando: "Procesando...",

    bloqueado_msg: "Acceso bloqueado. Elige un plan",

    dashboard: {
      titulo: "PecuariaTech",
      subtitulo: "Centro de control de la finca",
    },

    menu_dashboard: "Panel",
    menu_financeiro: "Finanzas",
    menu_rebanho: "Ganado",
    menu_pastagem: "Pastura",
    menu_cfo: "CFO Autónomo",
    menu_engorda: "Engorde",
    menu_assinatura: "Planes",
  },

  en: {
    login_titulo: "PecuariaTech",
    login_subtitulo: "Farm control center",

    email: "Email",
    password: "Password",
    enter: "Sign in",
    create_account: "Create account",
    forgot_password: "Forgot password",

    planos_titulo: "PecuariaTech Plans",
    planos_subtitulo: "Choose the best plan for your operation",

    mensal: "Monthly",
    trimestral: "Quarterly",
    anual: "Yearly",

    assinar: "Subscribe",
    processando: "Processing...",

    bloqueado_msg: "Access blocked. Choose a plan",

    dashboard: {
      titulo: "PecuariaTech",
      subtitulo: "Farm control center",
    },

    menu_dashboard: "Dashboard",
    menu_financeiro: "Finance",
    menu_rebanho: "Herd",
    menu_pastagem: "Pasture",
    menu_cfo: "Autonomous CFO",
    menu_engorda: "Fattening",
    menu_assinatura: "Plans",
  },
} as const;

// ===============================
// 🔍 RESOLVER NESTED KEYS
// ===============================
function getNested(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

// ===============================
const missing = new Set<string>();

// ===============================
function fallbackNeutral(key: string) {
  return key.split(".").pop() || "";
}

// ===============================
// 🌍 FUNÇÃO GLOBAL DE TRADUÇÃO
// ===============================
export function t(lang: Lang, key: string): string {
  const safeLang: Lang = lang in dictionary ? lang : "pt";

  const value = getNested(dictionary[safeLang], key);

  if (typeof value === "string") return value;

  // 🔥 log apenas em dev
  if (!missing.has(key)) {
    missing.add(key);

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n missing] ${key} (${safeLang})`);
    }
  }

  return fallbackNeutral(key);
}