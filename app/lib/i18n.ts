// ===============================
// 🌍 TIPOS
// ===============================
export type Lang = "pt" | "es";

// ===============================
// 🌍 CLIENT
// ===============================
export function getLangFromClient(): Lang {
  if (typeof window === "undefined") {
    return "pt";
  }

  const path = window.location.pathname;
  const urlLang = path.split("/")[1];

  if (urlLang === "es") return "es";

  return "pt";
}

// ===============================
// 🔁 SET LANG
// ===============================
export function setLangClient(lang: Lang) {
  if (typeof window === "undefined") return;

  localStorage.setItem("lang", lang);

  document.cookie =
    `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;

  const segments = window.location.pathname
    .split("/")
    .slice(2);

  const currentPath = segments.join("/");

  if (!currentPath) {
    window.location.href = `/${lang}`;
    return;
  }

  window.location.href = `/${lang}/${currentPath}`;
}

// ===============================
// 🧠 DICIONÁRIO
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
    planos_subtitulo:
      "Escolha o melhor plano para sua operação",

    mensal: "Mensal",
    trimestral: "Trimestral",
    anual: "Anual",

    assinar: "Assinar",
    processando: "Processando...",

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
    login_subtitulo:
      "Centro de control de la finca",

    email: "Correo electrónico",
    password: "Contraseña",
    enter: "Ingresar",
    create_account: "Crear cuenta",
    forgot_password: "Olvidé mi contraseña",

    planos_titulo: "Planes PecuariaTech",
    planos_subtitulo:
      "Elige el mejor plan para tu operación",

    mensal: "Mensual",
    trimestral: "Trimestral",
    anual: "Anual",

    assinar: "Suscribirse",
    processando: "Procesando...",

    menu_dashboard: "Panel",
    menu_financeiro: "Finanzas",
    menu_rebanho: "Ganado",
    menu_pastagem: "Pastura",
    menu_cfo: "CFO Autónomo",
    menu_engorda: "Engorde",
    menu_assinatura: "Planes",
  },
} as const;

// ===============================
// 🔍 NESTED KEYS
// ===============================
function getNested(obj: any, path: string) {
  return path
    .split(".")
    .reduce((acc, key) => acc?.[key], obj);
}

// ===============================
// 🌍 TRANSLATE
// ===============================
export function t(
  lang: Lang,
  key: string
): string {
  const safeLang: Lang =
    lang === "es" ? "es" : "pt";

  const value = getNested(
    dictionary[safeLang],
    key
  );

  if (typeof value === "string") {
    return value;
  }

  return key.split(".").pop() || "";
}