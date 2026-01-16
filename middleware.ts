// middleware.ts
// Paywall Oficial — PecuariaTech
// Equação Y: Sessão (cookie SSR) → Status assinatura (API canônica) → Permissão
// Blindagem: AUTH falha ≠ PAYWALL

import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/reset-password",
  "/planos",
  "/checkout",

  // APIs públicas canônicas
  "/api/auth/login",
  "/api/assinaturas/status",

  // APIs públicas operacionais
  "/api/pastagem",
  "/api/rebanho",
];

function isPublic(pathname: string) {
  return (
    ROTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/pecuariatech.png")
  );
}

function hasSupabaseSessionCookie(req: NextRequest) {
  const all = req.cookies.getAll();
  return all.some((c) => c.name.startsWith("sb-") && Boolean(c.value));
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1) rotas públicas
  if (isPublic(pathname)) return NextResponse.next();

  // 2) áreas protegidas
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/assinatura") ||
    pathname.startsWith("/api/financeiro") ||
    pathname.startsWith("/api/inteligencia"); // ✅ futuro

  if (!isProtected) return NextResponse.next();

  // 3) Gate AUTH (cookie SSR)
  if (!hasSupabaseSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 4) Gate PAYWALL
  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      method: "GET",
      cache: "no-store",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const data = await res.json().catch(() => null);

    const reason = String(data?.reason ?? "").toLowerCase().trim();

    // ✅ auth falha ≠ paywall
    const isAuthProblem =
      reason === "no_session" ||
      reason === "missing_env" ||
      reason === "internal_error" ||
      reason === "missing_token"; // só por blindagem: agora route.ts não gera isso

    if (isAuthProblem) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // ✅ assinatura inativa REAL
    if (data?.ativo !== true) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/financeiro/:path*",
    "/api/financeiro/:path*",
    "/api/inteligencia/:path*",
    "/cfo/:path*",
    "/assinatura/:path*",
  ],
};
