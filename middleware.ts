// middleware.ts
// Paywall Oficial — PecuariaTech
// Equação Y: Sessão (cookie SSR) → Status assinatura (API) → Permissão
// Objetivo: impedir loop "logou mas foi pro /planos"

import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/planos",
  "/checkout",

  // ✅ APIs públicas canônicas
  "/api/auth/login",          // ✅ NOVO (login SSR)
  "/api/assinaturas/status",  // status canônico

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

// ✅ Detecta cookie SSR do Supabase
function hasSupabaseSessionCookie(req: NextRequest) {
  // Supabase SSR normalmente grava cookies "sb-..."
  // Ex: sb-<project-ref>-auth-token
  const all = req.cookies.getAll();
  return all.some((c) => c.name.startsWith("sb-") && Boolean(c.value));
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // ✅ 1) rotas públicas
  if (isPublic(pathname)) return NextResponse.next();

  // ✅ 2) protege somente áreas privadas
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/assinatura") ||
    pathname.startsWith("/api/financeiro");

  if (!isProtected) return NextResponse.next();

  // ✅ 3) Gate de AUTH (cookie SSR do Supabase)
  if (!hasSupabaseSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ✅ 4) Gate de PAYWALL (assinatura)
  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      cache: "no-store",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    // ⚠️ status fora do ar = manda login (fallback seguro)
    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const data = await res.json().catch(() => null);

    // ✅ assinatura inativa = manda planos
    if (!data?.ativo) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    // ✅ tudo ok
    return NextResponse.next();
  } catch {
    // fallback seguro
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
    "/cfo/:path*",
    "/assinatura/:path*",
  ],
};
