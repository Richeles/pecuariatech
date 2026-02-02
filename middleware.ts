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

  // APIs públicas
  "/api/assinaturas/status",
  "/api/mercadopago/webhook",
];

function isPublic(pathname: string) {
  return (
    PUBLIC.some(p => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/api/admin") || // ADMIN FORA DO MIDDLEWARE
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  );
}

// ===============================
// MIDDLEWARE
// ===============================
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ----------------------------
  // ROTAS PÚBLICAS
  // ----------------------------
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ----------------------------
  // SOMENTE DASHBOARD
  // ----------------------------
  if (!pathname.startsWith("/dashboard")) {
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
      return redirectLogin(req);
    }

    const data = await res.json();

    const ativo = data?.ativo === true;
    const reason = String(data?.reason ?? "").toLowerCase();

    // NÃO LOGADO
    if (reason === "no_session" || reason === "missing_token") {
      return redirectLogin(req);
    }

    // SEM ASSINATURA
    if (!ativo) {
      const u = req.nextUrl.clone();
      u.pathname = "/planos";
      return NextResponse.redirect(u);
    }

    // OK
    return NextResponse.next();

  } catch {
    return redirectLogin(req);
  }
}

// ===============================
function redirectLogin(req: NextRequest) {
  const u = req.nextUrl.clone();
  u.pathname = "/login";
  u.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(u);
}

// ===============================
export const config = {
  matcher: ["/dashboard/:path*"],
};
