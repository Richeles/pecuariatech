// middleware.ts
// Paywall Oficial — PecuariaTech Autônomo
// Equação Y: Cookie SSR → API canônica /api/assinaturas/status → Permissão

import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/planos",
  "/checkout",

  // ✅ APIs públicas canônicas
  "/api/auth/login",
  "/api/assinaturas/status",

  // APIs públicas operacionais (read-only)
  "/api/pastagem",
  "/api/rebanho",
  "/api/engorda",
];

function isPublic(pathname: string) {
  // arquivos internos Next + assets
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/pecuariatech.png")) return true;
  if (pathname.startsWith("/robots.txt")) return true;
  if (pathname.startsWith("/sitemap")) return true;

  return ROTAS_PUBLICAS.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

// ✅ Detecta cookie SSR do Supabase
function hasSupabaseSessionCookie(req: NextRequest) {
  const all = req.cookies.getAll();
  // padrão: sb-<project-ref>-auth-token (ou variações)
  return all.some((c) => c.name.startsWith("sb-") && Boolean(c.value));
}

function redirectLogin(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

function redirectPlanos(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/planos";
  url.searchParams.set("reason", "assinatura_inativa");
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // ✅ 1) rotas públicas sempre liberadas
  if (isPublic(pathname)) return NextResponse.next();

  // ✅ 2) proteger só áreas privadas (NÃO inventar proteção fora disso)
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/assinatura") ||
    pathname.startsWith("/api/financeiro");

  if (!isProtected) return NextResponse.next();

  // ✅ 3) Gate AUTH (cookie SSR)
  if (!hasSupabaseSessionCookie(req)) {
    return redirectLogin(req, pathname);
  }

  // ✅ 4) Gate PAYWALL via API canônica (SEM acessar banco direto)
  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      cache: "no-store",
      headers: {
        // IMPORTANTÍSSIMO: passar cookies da request, senão o endpoint não enxerga sessão SSR
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    // se a API estiver fora do ar, fallback seguro: login (evita loop)
    if (!res.ok) {
      return redirectLogin(req, pathname);
    }

    const data = await res.json().catch(() => null);

    // assinatura inativa → planos
    if (!data?.ativo) {
      return redirectPlanos(req);
    }

    // tudo certo
    return NextResponse.next();
  } catch {
    // fallback seguro: login (evita loop /planos indevido)
    return redirectLogin(req, pathname);
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
