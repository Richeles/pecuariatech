import { NextRequest, NextResponse } from "next/server";

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
  "/dashboard/assinatura/plano",

  // APIs públicas
  "/api/assinaturas/status",
  "/api/mercadopago/webhook",
];

function isPublic(pathname: string) {
  return (
    PUBLIC.some(p => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  );
}

// ===============================
// BENEFÍCIOS
// ===============================
function canAccess(pathname: string, b: any) {

  if (pathname.startsWith("/dashboard/engorda") || pathname.startsWith("/api/engorda"))
    return b?.engorda === true;

  if (pathname.startsWith("/dashboard/cfo") || pathname.startsWith("/api/cfo"))
    return b?.cfo === true;

  if (
    pathname.startsWith("/dashboard/financeiro") ||
    pathname.startsWith("/api/financeiro") ||
    pathname.startsWith("/api/inteligencia/financeiro")
  ) return b?.financeiro === true;

  if (pathname.startsWith("/dashboard/rebanho"))
    return b?.rebanho === true;

  if (pathname.startsWith("/dashboard/pastagem"))
    return b?.pastagem === true;

  return true;
}

// ===============================
// MIDDLEWARE
// ===============================
export async function middleware(req: NextRequest) {

  const { pathname, origin } = req.nextUrl;

  // ----------------------------
  // PÚBLICAS
  // ----------------------------
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ----------------------------
  // ROTAS PROTEGIDAS
  // ----------------------------
  const protectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/financeiro") ||
    pathname.startsWith("/api/engorda") ||
    pathname.startsWith("/api/cfo") ||
    pathname.startsWith("/api/inteligencia");

  if (!protectedRoute) {
    return NextResponse.next();
  }

  try {

    // =====================================================
    // 1) ADMIN MASTER
    // =====================================================

    const adminRes = await fetch(`${origin}/api/admin/me`, {
      method: "GET",
      cache: "no-store",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (adminRes.ok) {
      const adminData = await adminRes.json().catch(() => null);
      if (adminData?.is_admin === true) {
        return NextResponse.next(); // bypass total
      }
    }

    // =====================================================
    // 2) ASSINATURA
    // =====================================================

    const res = await fetch(`${origin}/api/assinaturas/status`, {
      method: "GET",
      cache: "no-store",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (!res.ok) {
      const u = req.nextUrl.clone();
      u.pathname = "/login";
      u.searchParams.set("next", pathname);
      return NextResponse.redirect(u);
    }

    const data = await res.json().catch(() => null);

    // NÃO LOGADO
    if (data?.reason === "no_session" || data?.reason === "missing_token") {
      const u = req.nextUrl.clone();
      u.pathname = "/login";
      u.searchParams.set("next", pathname);
      return NextResponse.redirect(u);
    }

    // SEM ASSINATURA
    if (!data?.plano) {
      const u = req.nextUrl.clone();
      u.pathname = "/planos";
      return NextResponse.redirect(u);
    }

    const plano = data.plano;

    // =====================================================
    // 3) BENEFÍCIOS POR PLANO
    // =====================================================

    const benRes = await fetch(`${origin}/api/planos/beneficios?plano=${plano}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (!benRes.ok) {
      const u = req.nextUrl.clone();
      u.pathname = "/login";
      return NextResponse.redirect(u);
    }

    const beneficios = await benRes.json().catch(() => null);

    if (!beneficios) {
      const u = req.nextUrl.clone();
      u.pathname = "/login";
      return NextResponse.redirect(u);
    }

    // =====================================================
    // 4) GATE FINO
    // =====================================================

    if (!canAccess(pathname, beneficios)) {
      const u = req.nextUrl.clone();
      u.pathname = "/dashboard/assinatura/plano";
      u.searchParams.set("next", pathname);
      return NextResponse.redirect(u);
    }

    return NextResponse.next();

  } catch {

    const u = req.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("next", pathname);
    return NextResponse.redirect(u);

  }
}

// ===============================
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/financeiro/:path*",
    "/api/engorda/:path*",
    "/api/cfo/:path*",
    "/api/inteligencia/:path*",
  ],
};