// CAMINHO: middleware.ts
// Paywall Definitivo — PecuariaTech
// Next.js 16 | App Router
// Fonte Y soberana: /api/assinaturas/status

import { NextRequest, NextResponse } from "next/server";

// ================================
// ROTAS PÚBLICAS
// ================================
const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/planos",
  "/checkout",
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

  // 1️⃣ Arquivos estáticos
  if (
    EXTENSOES_PUBLICAS.some((ext) => pathname.endsWith(ext)) ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Rotas públicas
  if (
    ROTAS_PUBLICAS.some(
      (rota) => pathname === rota || pathname.startsWith(rota + "/")
    )
  ) {
    return NextResponse.next();
  }

  // 3️⃣ Validação real via Fonte Y
  try {
    const res = await fetch(
      `${origin}/api/assinaturas/status`,
      {
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }

    const data = await res.json();

    if (!data?.ativo) {
      return NextResponse.redirect(
        new URL("/planos", req.url)
      );
    }

    // ✅ Assinatura ativa
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }
}

// ================================
// APLICAR PAYWALL
// ================================
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/financeiro/:path*",
    "/cfo/:path*",
    "/assinatura/:path*",
    "/api/financeiro/:path*",
    "/api/planos/:path*",
  ],
};
