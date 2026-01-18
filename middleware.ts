// middleware.ts
// Paywall Oficial — PecuariaTech (SaaS por Plano)
// Equação Y: Cookie SSR → Status assinatura (API canônica status-server) → Permissões (beneficios)
// Blindagem: AUTH falha ≠ PAYWALL (não manda logado para /planos por erro técnico)

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

  // APIs públicas canônicas
  "/api/auth/login",
  "/api/assinaturas/status-server", // ✅ âncora canônica SSR cookie-first
  "/api/assinaturas/status", // mantém compat (se existir uso antigo)

  // APIs públicas operacionais (se você quer manter acessível)
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
  // Se não veio benefícios por algum motivo, assume mínimo (não quebra)
  const b = beneficios ?? {};

  // --- ENGORDA ---
  // /dashboard/engorda (base)
  if (pathname.startsWith("/dashboard/engorda")) {
    // Nutrição é parte de engorda base (se quiser tratar como ultra, ajuste aqui)
    const okBase = b.engorda_base === true || b.engorda === true;
    return okBase;
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

  // --- ESG (quando virar rota real) ---
  if (pathname.startsWith("/dashboard/esg") || pathname.startsWith("/api/esg")) {
    return b.esg === true;
  }

  // --- REBANHO / PASTAGEM ---
  // se você quiser travar por plano também, dá pra ativar aqui
  if (pathname.startsWith("/dashboard/rebanho")) {
    return b.rebanho !== false; // default true
  }
  if (pathname.startsWith("/dashboard/pastagem")) {
    return b.pastagem !== false; // default true
  }

  // padrão: permite
  return true;
}

// ===============================
// Middleware principal
// ===============================
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1) rotas públicas
  if (isPublic(pathname)) return NextResponse.next();

  // 2) áreas protegidas (mantém seu padrão)
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

  // 4) Gate PAYWALL (âncora canônica)
  try {
    const res = await fetch(`${origin}/api/assinaturas/status-server`, {
      method: "GET",
      cache: "no-store",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    // Se API falhar → é problema técnico/auth → manda login (NUNCA /planos)
    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      url.searchParams.set("reason", "status_server_unavailable");
      return NextResponse.redirect(url);
    }

    const data = (await res.json().catch(() => null)) as any;

    // Blindagem: shape estável esperado
    const ativo = data?.ativo === true;
    const beneficios = data?.beneficios ?? null;

    // Se não ativo → paywall real → /planos
    if (!ativo) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    // ✅ Permissão por plano
    if (!canAccess(pathname, beneficios)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/assinatura/plano";
      url.searchParams.set("reason", "upgrade_required");
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // fallback técnico: manda login, não planos (blindagem anti-loop)
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
