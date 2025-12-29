// middleware.ts
// Paywall REAL — produção
// Fonte Y: Supabase + Assinaturas

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/planos",
  "/checkout",
  "/sucesso",
  "/erro",
  "/reset-password",
  "/api/checkout",
  "/api/checkout/preference",
  "/api/checkout/webhook",
  "/api/trial",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sb-access-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/assinatura/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.redirect(new URL("/planos", req.url));
    }

    const data = await res.json();

    if (data.status !== "ativa") {
      return NextResponse.redirect(new URL("/planos", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/erro", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard-real/:path*",
    "/financeiro/:path*",
    "/rebanho/:path*",
    "/pastagem/:path*",
    "/ultrabiologica/:path*",
  ],
};
