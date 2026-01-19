// middleware.ts
// Paywall Oficial — PecuariaTech
// Equação Y: Cookie SSR → /api/assinaturas/status → Middleware → UI
// Triângulo 360: Auth • Paywall • Permissões
// REGRA: erro técnico NUNCA vira /planos

import { NextRequest, NextResponse } from "next/server";

/* -------------------------------------------------------------------------- */
/* Rotas públicas                                                              */
/* -------------------------------------------------------------------------- */
const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/reset-password",
  "/planos",
  "/checkout",
  "/inicio",
  "/sucesso",
  "/erro",
  "/paywall",

  // APIs públicas reais
  "/api/auth",
  "/api/checkout",
  "/api/planos",
  "/api/webhooks",
];

function isPublic(pathname: string) {
  return (
    ROTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/pecuariatech.png")
  );
}

/* -------------------------------------------------------------------------- */
/* Auth SSR                                                                    */
/* -------------------------------------------------------------------------- */
function hasSupabaseSessionCookie(req: NextRequest): boolean {
  return req.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && Boolean(c.value));
}

/* -------------------------------------------------------------------------- */
/* Permissões por plano                                                        */
/* -------------------------------------------------------------------------- */
type Beneficios = Record<string, any>;

function canAccess(pathname: string, b: Beneficios | null): boolean {
  const beneficios = b ?? {};

  if (pathname.startsWith("/dashboard/engorda")) {
    return beneficios.engorda_base === true || beneficios.engorda === true;
  }

  if (pathname.startsWith("/dashboard/cfo") || pathname.startsWith("/api/cfo")) {
    return beneficios.cfo === true;
  }

  if (
    pathname.startsWith("/dashboard/financeiro") ||
    pathname.startsWith("/api/financeiro") ||
    pathname.startsWith("/api/inteligencia/financeiro")
  ) {
    return beneficios.financeiro === true || beneficios.cfo === true;
  }

  if (pathname.startsWith("/dashboard/rebanho")) {
    return beneficios.rebanho !== false;
  }

  if (pathname.startsWith("/dashboard/pastagem")) {
    return beneficios.pastagem !== false;
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Middleware                                                                  */
/* -------------------------------------------------------------------------- */
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/assinatura") ||
    pathname.startsWith("/api/financeiro") ||
    pathname.startsWith("/api/inteligencia") ||
    pathname.startsWith("/api/cfo") ||
    pathname.startsWith("/api/engorda");

  if (!isProtected) return NextResponse.next();

  /* ----------------------------- AUTH GATE ----------------------------- */
  if (!hasSupabaseSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  /* --------------------------- PAYWALL GATE ----------------------------- */
  try {
    const res = await fetch(
      `${origin}/api/assinaturas/status?ts=${Date.now()}`,
      {
        method: "GET",
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("reason", "status_api_error");
      return NextResponse.redirect(url);
    }

    const data = await res.json();

    const ativo = data?.ativo === true;
    const beneficios = data?.beneficios ?? null;
    const reason = String(data?.reason ?? "").toLowerCase();

    // erro de sessão → login
    if (!ativo && reason.includes("session")) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // assinatura realmente inativa → planos
    if (!ativo) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    // permissão por plano
    if (!canAccess(pathname, beneficios)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/assinatura/plano";
      url.searchParams.set("reason", "upgrade_required");
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("reason", "middleware_exception");
    return NextResponse.redirect(url);
  }
}

/* -------------------------------------------------------------------------- */
/* Matcher                                                                     */
/* -------------------------------------------------------------------------- */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/financeiro/:path*",
    "/api/financeiro/:path*",
    "/api/inteligencia/:path*",
    "/api/cfo/:path*",
    "/api/engorda/:path*",
    "/cfo/:path*",
    "/assinatura/:path*",
  ],
};
