// middleware.ts
// Paywall Oficial — PecuariaTech (Blindagem SaaS)
// Equação Y: Sessão (cookie SSR) → Status assinatura (API âncora) → Permissão
// Objetivo: impedir loop "logou mas foi pro /planos" e impedir regressão por instabilidade API

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/planos",
  "/checkout",

  // APIs públicas canônicas
  "/api/auth/login",
  "/api/assinaturas/status",

  // módulos públicos operacionais (se existirem públicos)
  "/api/pastagem",
  "/api/rebanho",
  "/api/engorda",
];

function isPublic(pathname: string) {
  return (
    ROTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/pecuariatech.png")
  );
}

// ✅ Detecta cookie SSR do Supabase (sb-...)
function hasSupabaseSessionCookie(req: NextRequest) {
  const all = req.cookies.getAll();
  return all.some((c) => c.name.startsWith("sb-") && Boolean(c.value));
}

function redirectLogin(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

function redirectPlanos(req: NextRequest, reason: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/planos";
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1) rotas públicas
  if (isPublic(pathname)) return NextResponse.next();

  // 2) proteger somente áreas privadas (HUB intocável)
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/assinatura") ||
    pathname.startsWith("/api/financeiro");

  if (!isProtected) return NextResponse.next();

  // 3) AUTH gate (cookie SSR)
  if (!hasSupabaseSessionCookie(req)) {
    return redirectLogin(req, pathname);
  }

  // 4) PAYWALL gate (assinatura via endpoint canônico âncora)
  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      cache: "no-store",
      headers: {
        // repassar cookie SSR para o endpoint
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    // ✅ Regra de ouro:
    // Se o status endpoint falhar (instabilidade), NÃO mandar pro /planos.
    // Mandar pro /login (fallback seguro). Isso evita o bug histórico.
    if (!res.ok) {
      return redirectLogin(req, pathname);
    }

    const data = await res.json().catch(() => null);

    // Se vier payload inválido, tratar como instabilidade (fallback seguro)
    if (!data || typeof data.ativo !== "boolean") {
      return redirectLogin(req, pathname);
    }

    // ✅ Assinatura inativa = manda planos
    if (!data.ativo) {
      return redirectPlanos(req, "assinatura_inativa");
    }

    // ✅ Tudo ok: pode entrar
    return NextResponse.next();
  } catch {
    // fallback seguro: nunca joga em /planos por erro interno
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
