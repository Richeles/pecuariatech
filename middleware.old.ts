import { NextRequest, NextResponse } from "next/server";

// ===============================
// 🌍 CONFIG I18N
// ===============================
const SUPPORTED_LANGS = ["pt", "es", "en"];
const DEFAULT_LANG = "pt";

// ===============================
// ROTAS PÚBLICAS
// ===============================
const PUBLIC = [
  "/",
  "/login",
  "/reset",
  "/reset-password",
  "/planos",
  "/checkout",
  "/inicio",
  "/sucesso",
  "/erro",

  // APIs públicas
  "/api/assinaturas/status",
  "/api/mercadopago/webhook",
];

function isPublic(pathname: string) {
  return (
    PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  );
}

// ===============================
// 🌍 EXTRAI LANG DA URL
// ===============================
function getLangFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  const first = segments[1];
  return SUPPORTED_LANGS.includes(first) ? first : null;
}

// ===============================
// MIDDLEWARE
// ===============================
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ----------------------------
  // 🌍 I18N REDIRECT (ANTES DE TUDO)
  // ----------------------------
  const hasLang = getLangFromPath(pathname);

  if (!hasLang) {
    const cookieLang =
      req.cookies.get("lang")?.value || DEFAULT_LANG;

    const url = req.nextUrl.clone();
    url.pathname = `/${cookieLang}${pathname}`;

    return NextResponse.redirect(url);
  }

  // remove /pt /es /en para lógica interna
  const pathnameSemLang = pathname.replace(/^\/(pt|es|en)/, "") || "/";

  // ----------------------------
  // ROTAS PÚBLICAS
  // ----------------------------
  if (isPublic(pathnameSemLang)) {
    return NextResponse.next();
  }

  // ----------------------------
  // SOMENTE DASHBOARD
  // ----------------------------
  if (!pathnameSemLang.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  try {
    // ==========================
    // STATUS ASSINATURA (COOKIE FIRST)
    // ==========================
    const res = await fetch(
      `${req.nextUrl.origin}/api/assinaturas/status`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
      }
    );

    if (!res.ok) {
      return redirectLogin(req, hasLang);
    }

    const data = await res.json();

    const ativo = data?.ativo === true;
    const reason = String(data?.reason ?? "").toLowerCase();

    // NÃO LOGADO
    if (reason === "no_session" || reason === "missing_token") {
      return redirectLogin(req, hasLang);
    }

    // SEM ASSINATURA
    if (!ativo) {
      const u = req.nextUrl.clone();
      u.pathname = `/${hasLang}/planos`;
      return NextResponse.redirect(u);
    }

    // OK
    return NextResponse.next();

  } catch {
    return redirectLogin(req, hasLang);
  }
}

// ===============================
function redirectLogin(req: NextRequest, lang: string) {
  const u = req.nextUrl.clone();
  u.pathname = `/${lang}/login`;
  u.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(u);
}

// ===============================
export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};