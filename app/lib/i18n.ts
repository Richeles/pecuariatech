// app/lib/i18n.ts
// PecuariaTech International Runtime
// Arquitetura canônica i18n
// PT + ES estabilizado
// Compatível com Equação Y + Regra Z
// Sem locale routing
// Persistência cognitiva SaaS

export type Lang =
  | "pt"
  | "es";

/* =====================================================
   STORAGE
===================================================== */

const LANG_KEY =
  "pecuariatech_lang";

/* =====================================================
   DEFAULT
===================================================== */

export const DEFAULT_LANG: Lang =
  "pt";

/* =====================================================
   SUPPORTED
===================================================== */

export const SUPPORTED_LANGS: Lang[] = [
  "pt",
  "es",
];

/* =====================================================
   VALIDATOR
===================================================== */

export function isValidLang(
  value?: string | null
): value is Lang {

  return (
    value === "pt" ||
    value === "es"
  );
}

/* =====================================================
   GET LANG CLIENT
===================================================== */

export function getLangFromClient(): Lang {

  if (
    typeof window ===
    "undefined"
  ) {

    return DEFAULT_LANG;
  }

  try {

    const stored =
      window.localStorage.getItem(
        LANG_KEY
      );

    if (
      isValidLang(stored)
    ) {

      return stored;
    }

    const browserLang =
      navigator.language
        ?.toLowerCase()
        ?.slice(0, 2);

    if (
      browserLang === "es"
    ) {

      return "es";
    }

    return DEFAULT_LANG;

  } catch {

    return DEFAULT_LANG;
  }
}

/* =====================================================
   SET LANG CLIENT
===================================================== */

export function setLangClient(
  lang: Lang
) {

  if (
    typeof window ===
    "undefined"
  ) {

    return;
  }

  try {

    window.localStorage.setItem(
      LANG_KEY,
      lang
    );

    document.cookie =
      `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;

  } catch {

    // noop
  }
}

/* =====================================================
   TRANSLATIONS
===================================================== */

const translations = {

  pt: {

    /* =====================================
       GERAL
    ===================================== */

    mensal:
      "MENSAL",

    trimestral:
      "TRIMESTRAL",

    anual:
      "ANUAL",

    assinar:
      "ASSINAR",

    processando:
      "PROCESSANDO...",

    enter:
      "ENTRAR",

    email:
      "Email",

    password:
      "Senha",

    nome:
      "Nome completo",

    telefone:
      "Telefone",

    pais:
      "País",

    idioma:
      "Idioma",

    continuar:
      "CONTINUAR",

    criar_conta:
      "CRIAR CONTA",

    iniciar:
      "INICIAR",

    voltar:
      "VOLTAR",

    /* =====================================
       LOGIN
    ===================================== */

    login_title:
      "PecuariaTech",

    login_subtitle:
      "Infraestrutura operacional pecuária inteligente",

    login_error:
      "Falha no login. Verifique email e senha.",

    login_unexpected:
      "Erro inesperado no login.",

    login_loading:
      "ENTRANDO...",

    /* =====================================
       CADASTRO
    ===================================== */

    register_title:
      "Cadastro PecuariaTech",

    register_subtitle:
      "Governança operacional, inteligência financeira e gestão pecuária em uma única plataforma.",

    register_error:
      "Erro interno ao criar conta.",

    register_success:
      "Conta criada com sucesso.",

    /* =====================================
       PLANOS
    ===================================== */

    planos_title:
      "Planos PecuariaTech",

    planos_subtitle:
      "Cada plano foi pensado para uma realidade diferente no campo.",

    /* =====================================
       DASHBOARD
    ===================================== */

    "dashboard.titulo":
      "PecuariaTech",

    "dashboard.subtitulo":
      "Inteligência operacional pecuária",

    /* =====================================
       CHECKOUT
    ===================================== */

    checkout_loading:
      "Redirecionando para checkout...",

    checkout_error:
      "Erro ao iniciar checkout.",
  },

  es: {

    /* =====================================
       GERAL
    ===================================== */

    mensal:
      "MENSUAL",

    trimestral:
      "TRIMESTRAL",

    anual:
      "ANUAL",

    assinar:
      "SUSCRIBIRSE",

    processando:
      "PROCESANDO...",

    enter:
      "INGRESAR",

    email:
      "Correo",

    password:
      "Contraseña",

    nome:
      "Nombre completo",

    telefone:
      "Teléfono",

    pais:
      "País",

    idioma:
      "Idioma",

    continuar:
      "CONTINUAR",

    criar_conta:
      "CREAR CUENTA",

    iniciar:
      "INICIAR",

    voltar:
      "VOLVER",

    /* =====================================
       LOGIN
    ===================================== */

    login_title:
      "PecuariaTech",

    login_subtitle:
      "Infraestructura operacional pecuaria inteligente",

    login_error:
      "Error de autenticación.",

    login_unexpected:
      "Error inesperado.",

    login_loading:
      "INGRESANDO...",

    /* =====================================
       CADASTRO
    ===================================== */

    register_title:
      "Registro PecuariaTech",

    register_subtitle:
      "Gobernanza operacional, inteligencia financiera y gestión pecuaria en una sola plataforma.",

    register_error:
      "Error interno al crear cuenta.",

    register_success:
      "Cuenta creada correctamente.",

    /* =====================================
       PLANOS
    ===================================== */

    planos_title:
      "Planes PecuariaTech",

    planos_subtitle:
      "Cada plan fue diseñado para diferentes realidades del campo.",

    /* =====================================
       DASHBOARD
    ===================================== */

    "dashboard.titulo":
      "PecuariaTech",

    "dashboard.subtitulo":
      "Inteligencia operacional pecuaria",

    /* =====================================
       CHECKOUT
    ===================================== */

    checkout_loading:
      "Redireccionando al checkout...",

    checkout_error:
      "Error al iniciar checkout.",
  },
} as const;

/* =====================================================
   TRANSLATION TYPE
===================================================== */

type TranslationKey =
  keyof typeof translations.pt;

/* =====================================================
   TRANSLATE
===================================================== */

export function t(
  lang: Lang,
  key: TranslationKey | string
): string {

  const safeLang =
    isValidLang(lang)
      ? lang
      : DEFAULT_LANG;

  const value =
    translations?.[
      safeLang
    ]?.[
      key as TranslationKey
    ];

  if (
    typeof value ===
    "string"
  ) {

    return value;
  }

  return String(key);
}