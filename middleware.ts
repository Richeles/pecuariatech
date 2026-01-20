// middleware.ts
// Paywall Oficial — PecuariaTech (SaaS por Plano)
// ✅ Equação Y: Cookie SSR → API canônica (/api/assinaturas/status) → Permissões (beneficios)
// ✅ Blindagem: erro técnico/auth ≠ paywall (NUNCA manda logado para /planos por falha técnica)

import { NextRequest, NextResponse } from "next/server";

// ===============================
// Rotas públicas (não passam no paywall)
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

  // ✅ Upgrade flow deve ser sempre acessível
  "/dashboard/assinatura/plano",

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

// ===============================
// Cookie SSR (Supabase)
// ===============================
function hasSupabaseSessionCookie(req: NextRequest) {
  const all = req.cookies.getAll();
  return all.some((c) => c.name.startsWith("sb-") && Boolean(c.value));
}

// ===============================
// Permissão por rota (Triângulo 360)
// ===============================
type Beneficios = Record<string, any>;

function canAccess(pathname: string, beneficios: Beneficios): boolean {
  const b = beneficios ?? {};

  // --- ENGORDA ---
  if (pathname.startsWith("/dashboard/engorda") || pathname.startsWith("/api/engorda")) {
    return b.engorda_base === true || b.engorda === true;
  }

  // --- CFO ---
  if (pathname.startsWith("/dashboard/cfo") || pathname.startsWith("/api/cfo")) {
    return b.cfo === true;
  }

  // --- FINANCEIRO ---
  if (
    pathname.startsWith("/dashboard/financeiro") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/api/financeiro") ||
    pathname.startsWith("/api/inteligencia/financeiro")
  ) {
    return b.financeiro === true || b.cfo === true;
  }

  // --- REBANHO / PASTAGEM ---
  if (pathname.startsWith("/dashboard/rebanho")) return b.rebanho !== false;
  if (pathname.startsWith("/dashboard/pastagem")) return b.pastagem !== false;

  return true;
}

// ===============================
// Middleware principal
// ===============================
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
    pathname.startsWith("/api/inteligencia") ||
    pathname.startsWith("/api/cfo") ||
    pathname.startsWith("/api/engorda");

  if (!isProtected) return NextResponse.next();

  // 3) Gate AUTH (cookie SSR)
  if (!hasSupabaseSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ✅ Se já está no upgrade flow, não aplica gate de benefícios
  if (pathname.startsWith("/dashboard/assinatura/plano")) {
    return NextResponse.next();
  }

  // 4) Gate PAYWALL (API canônica única)
  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      method: "GET",
      cache: "no-store",
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });

    // ✅ Se API falhar: LOGIN (problema técnico/auth)
    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      url.searchParams.set("reason", "status_unavailable");
      return NextResponse.redirect(url);
    }

    const data = (await res.json().catch(() => null)) as any;

    const ativo = data?.ativo === true;
    const beneficios = data?.beneficios ?? null;

    // ✅ Só assinatura realmente inativa vai para /planos
    if (!ativo) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    // ✅ Gate por permissões/nível
    if (!canAccess(pathname, beneficios)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/assinatura/plano";
      url.searchParams.set("reason", "upgrade_required");
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // ✅ fallback técnico: LOGIN
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    url.searchParams.set("reason", "middleware_exception");
    return NextResponse.redirect(url);
  }
}

// ✅ matcher: só onde precisa
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
