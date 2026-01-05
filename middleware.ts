// middleware.ts
// Paywall definitivo — PecuariaTech
// Next.js 16 | App Router
// Fonte Y soberana: /api/assinaturas/status

import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset-password",
  "/planos",
  "/checkout",
];

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

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1️⃣ liberar estáticos
  if (
    pathname.startsWith("/_next") ||
    EXTENSOES_PUBLICAS.some((ext) => pathname.endsWith(ext))
  ) {
    return NextResponse.next();
  }

  // 2️⃣ liberar rotas públicas
  if (
    ROTAS_PUBLICAS.some(
      (rota) => pathname === rota || pathname.startsWith(rota + "/")
    )
  ) {
    return NextResponse.next();
  }

  // 3️⃣ consultar status REAL da assinatura (com cookies)
  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const data = await res.json();

    if (!data?.ativo) {
      return NextResponse.redirect(new URL("/planos", req.url));
    }

    // ✅ assinatura ativa
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/financeiro/:path*",
    "/api/financeiro/:path*",
    "/api/planos/:path*",
    "/cfo/:path*",
  ],
};
