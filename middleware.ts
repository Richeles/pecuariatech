// middleware.ts
// Paywall Oficial — PecuariaTech
// Equação Y aplicada (API canônica liberada)

import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/planos",
  "/checkout",

  // ✅ APIs CANÔNICAS (READ-ONLY)
  "/api/pastagem",
  "/api/rebanho",
];

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // ✅ 1) Libera rotas públicas e APIs canônicas
  if (
    ROTAS_PUBLICAS.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    ) ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  try {
    // ✅ 2) Paywall apenas para áreas financeiras / privadas
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const data = await res.json();

    if (!data?.ativo) {
      return new NextResponse(
        JSON.stringify({ error: "ASSINATURA_INATIVA" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

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
    "/cfo/:path*",
    "/assinatura/:path*",
  ],
};
