// middleware.ts
// Auth Gate — Next.js 16 SAFE

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset-password",
  "/planos",
  "/checkout",
  "/sucesso",
  "/erro",
  "/api",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("supabase-auth-token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
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
