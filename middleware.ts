// middleware.ts
// Paywall Oficial — PecuariaTech
// Equação Y: API canônica (/api/assinaturas/status) governa o acesso
// Anti-loop: login nunca quebra por assinatura
// Server-friendly: usa cookie no fetch (NUNCA Bearer)

import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/planos",
  "/checkout",
];

// ✅ Liberação inteligente de APIs públicas (read-only / essenciais)
function isPublic(pathname: string) {
  return (
    ROTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/pecuariatech.png") ||
    // ✅ Âncoras do paywall
    pathname.startsWith("/api/assinaturas/status") ||
    pathname.startsWith("/api/assinaturas/status-server") ||
    // ✅ APIs read-only do sistema (Equação Y)
    pathname.startsWith("/api/pastagem") ||
    pathname.startsWith("/api/rebanho") ||
    pathname.startsWith("/api/engorda")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // ✅ 1) rotas públicas
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ✅ 2) protege apenas áreas privadas (mantém HUB intocável)
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/assinatura") ||
    pathname.startsWith("/api/financeiro");

  if (!isProtected) {
    return NextResponse.next();
  }

  try {
    // ✅ 3) checar assinatura via cookie
    const cookie = req.headers.get("cookie") ?? "";

    const res = await fetch(`${origin}/api/assinaturas/status`, {
      cache: "no-store",
      headers: { cookie },
    });

    // ✅ BLINDAGEM: se a API do paywall falhar, manda para /planos (não /login)
    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "paywall_unavailable");
      return NextResponse.redirect(url);
    }

    const data = await res.json();

    // ✅ se assinatura inativa → /planos
    if (!data?.ativo) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // ✅ fallback: erro geral -> /planos (mais SaaS)
    const url = req.nextUrl.clone();
    url.pathname = "/planos";
    url.searchParams.set("reason", "paywall_error");
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/financeiro/:path*",
    "/api/financeiro/:path*",
    "/cfo/:path*",
    "/assinatura/:path*",
  ],
};
