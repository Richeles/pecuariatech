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

  const saved = localStorage.getItem("lang");
  if (saved === "pt" || saved === "es" || saved === "en") {
    return saved;
  }

  const browser = navigator.language.toLowerCase();

  if (browser.startsWith("es")) return "es";
  if (browser.startsWith("en")) return "en";

  return "pt";
}

// ===============================
// 🌍 SET
// ===============================
export function setLangClient(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem("lang", lang);
}

// ===============================
// 🧠 DICIONÁRIO (EXPANDIDO)
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

    // 🔥 NOVO — MENU
    menu_dashboard: "Dashboard",
    menu_financeiro: "Financeiro",
    menu_rebanho: "Rebanho",
    menu_pastagem: "Pastagem",
    menu_cfo: "CFO Autônomo",
    menu_engorda: "Engorda",
    menu_assinatura: "Planos",

    // 🔥 NOVO — DASHBOARD
    dashboard: {
      modulos: {
        financeiro: {
          titulo: "Financeiro",
          desc: "Gestão financeira completa",
        },
        cfo: {
          titulo: "CFO Autônomo",
        },
      },
      cards: {
        receita: "Receita",
        custos: "Custos",
        resultado: "Resultado",
        margem: "Margem",
      },
    },

    // 🔥 NOVO — FINANCEIRO
    financeiro: {
      sem_dados: "Nenhum dado financeiro disponível",
      alerta_cfo:
        "O CFO Autônomo analisa seus dados automaticamente",

      dre: {
        titulo: "DRE",
        desc: "Demonstrativo de resultado",
        acao: "Ver DRE",
      },
    },
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
// 🔍 GET NESTED (FIX CRÍTICO)
// ===============================
function getNested(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;

  return path.split(".").reduce((acc: any, key) => {
    return acc?.[key];
  }, obj as any);
}

// ===============================
// 🧠 CACHE
// ===============================
const missing = new Set<string>();

// ===============================
// 🧠 FALLBACK (MELHORADO)
// ===============================
function fallbackNeutral(key: string): string {
  // mostra última parte da chave → melhora UX
  const parts = key.split(".");
  return parts[parts.length - 1] || "";
}

// ===============================
// 🧠 FUNÇÃO PRINCIPAL
// ===============================
export function t(lang: Lang, key: string): string {
  const safeLang: Lang = lang in dictionary ? lang : "pt";

  const value = getNested(dictionary[safeLang], key);

  if (typeof value === "string") return value;

  if (!missing.has(key)) {
    missing.add(key);

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n missing] ${key} (${safeLang})`);
    }
  }

  return fallbackNeutral(key);
}