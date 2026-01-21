// middleware.ts
// PecuariaTech Autônomo — Middleware CANÔNICO
//
// PRINCÍPIOS:
// ✅ Equação Y: Cookie SSR → /api/assinaturas/status → decisão
// ✅ Triângulo 360:
//    - AUTH: sessão válida
//    - PAYWALL: assinatura ativa
//    - NÍVEL: NUNCA no middleware (somente dentro dos módulos)
// ✅ Regra Z: erro técnico/auth NUNCA manda para /planos

import { NextRequest, NextResponse } from "next/server";

// ===============================
// Rotas públicas (NÃO passam no paywall)
// ===============================
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

  // Upgrade flow sempre acessível
  "/dashboard/assinatura/plano",

  // API canônica de status (Fonte Y)
  "/api/assinaturas/status",

  // Webhook financeiro
  "/api/mercadopago/webhook",
];

function isPublic(pathname: string) {
  return (
    ROTAS_PUBLICAS.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    ) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  );
}

// ===============================
// Cookie SSR (Supabase)
// ===============================
function hasSupabaseSessionCookie(req: NextRequest) {
  return req.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && Boolean(c.value));
}

// ===============================
// Permissão por rota (NÍVEL / BENEFÍCIOS)
// ⚠️ ATENÇÃO: Financeiro NÃO é bloqueado aqui
// ===============================
type Beneficios = Record<string, any>;

function canAccess(pathname: string, beneficios: Beneficios): boolean {
  const b = beneficios ?? {};

  // --- ENGORDA ---
  if (
    pathname.startsWith("/dashboard/engorda") ||
    pathname.startsWith("/api/engorda")
  ) {
    return b.engorda === true || b.engorda_base === true;
  }

  // --- CFO (Premium-only) ---
  if (
    pathname.startsWith("/dashboard/cfo") ||
    pathname.startsWith("/api/cfo")
  ) {
    return b.cfo === true;
  }

  // --- FINANCEIRO (PROGRESSIVO / TODOS OS PLANOS ATIVOS) ---
  // Regra de produto:
  // Financeiro existe em TODOS os planos ativos.
  // Middleware NÃO decide profundidade.
  // Gate fino acontece dentro do módulo / APIs.

  if (
    pathname === "/dashboard/financeiro" ||
    pathname.startsWith("/dashboard/financeiro/")
  ) {
    return true;
  }

  if (pathname.startsWith("/api/financeiro")) {
    return true;
  }

  if (pathname.startsWith("/api/inteligencia/financeiro")) {
    return true;
  }

  // --- REBANHO / PASTAGEM ---
  if (pathname.startsWith("/dashboard/rebanho")) {
    return b.rebanho !== false;
  }

  if (pathname.startsWith("/dashboard/pastagem")) {
    return b.pastagem !== false;
  }

  return true;
}

// ===============================
// Middleware principal
// ===============================
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1) Rotas públicas
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 2) Proteger apenas áreas privadas
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/financeiro") ||
    pathname.startsWith("/api/engorda") ||
    pathname.startsWith("/api/cfo") ||
    pathname.startsWith("/api/inteligencia");

  if (!isProtected) {
    return NextResponse.next();
  }

  // 3) AUTH — exige sessão
  if (!hasSupabaseSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 4) PAYWALL — assinatura ativa (Fonte Única)
  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      method: "GET",
      cache: "no-store",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (!res.ok) {
      // Regra Z: erro técnico → login
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      url.searchParams.set("reason", "status_unavailable");
      return NextResponse.redirect(url);
    }

    const data = (await res.json().catch(() => null)) as any;

    // Sem sessão válida
    if (data?.reason === "no_session" || data?.reason === "missing_token") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Assinatura realmente inativa
    if (data?.ativo === false) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    // Gate por benefício (EXCETO FINANCEIRO)
    const beneficios = data?.beneficios ?? {};
    if (!canAccess(pathname, beneficios)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/assinatura/plano";
      url.searchParams.set("reason", "upgrade_required");
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // Regra Z: exceção técnica → login
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    url.searchParams.set("reason", "middleware_exception");
    return NextResponse.redirect(url);
  }
}

// ===============================
// Matcher focado (sem overhead)
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
