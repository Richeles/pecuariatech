// CAMINHO: middleware.ts
// Paywall Definitivo — PecuariaTech
// Next.js 16 | App Router
// Fonte Y soberana: /api/assinaturas/status

import { NextRequest, NextResponse } from "next/server";

// ================================
// ROTAS PÚBLICAS (SITE / AUTH)
// ================================
const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/planos",
  "/checkout",
];

// ================================
// APIs INTERNAS LIBERADAS (APÓS LOGIN)
// ================================
const APIS_DASHBOARD = [
  // Financeiro
  "/api/financeiro/indicadores-avancados",
  "/api/financeiro/dre",
  "/api/financeiro/ebitda",
  "/api/financeiro/tendencia",
  "/api/financeiro/cfo/autonomo",

  // IA de Planos
  "/api/planos/recomendacao",
];

// ================================
// EXTENSÕES ESTÁTICAS
// ================================
const EXTENSOES_PUBLICAS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".css",
  ".js",
  ".ico",
  ".webp",
];

// ================================
// MIDDLEWARE
// ================================
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // ================================
  // 1) LIBERAR ARQUIVOS ESTÁTICOS
  // ================================
  if (
    EXTENSOES_PUBLICAS.some((ext) => pathname.endsWith(ext)) ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // ================================
  // 2) LIBERAR ROTAS PÚBLICAS
  // ================================
  if (
    ROTAS_PUBLICAS.some(
      (rota) => pathname === rota || pathname.startsWith(rota + "/")
    )
  ) {
    return NextResponse.next();
  }

  // ================================
  // 3) OBTER TOKEN SUPABASE
  // ================================
  const token =
    // Header Authorization (APIs / testes)
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    // Cookie Supabase (browser)
    Array.from(req.cookies.getAll()).find((c) =>
      c.name.includes("auth-token")
    )?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ================================
  // 4) CONSULTAR STATUS REAL (Y)
  // ================================
  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    // ❌ Assinatura inativa
    if (!data?.ativo) {
      return NextResponse.redirect(new URL("/planos", req.url));
    }

    // ================================
    // 5) ASSINATURA ATIVA
    // ================================

    // ✅ Liberar APIs internas explicitamente
    if (APIS_DASHBOARD.some((api) => pathname.startsWith(api))) {
      return NextResponse.next();
    }

    // ✅ Liberar áreas protegidas
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// ================================
// APLICAR PAYWALL
// ================================
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/financeiro/:path*",
    "/api/planos/:path*", // 👈 FUNDAMENTAL
    "/financeiro/:path*",
    "/cfo/:path*",
    "/assinatura/:path*",
  ],
};
