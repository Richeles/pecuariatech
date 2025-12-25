// CAMINHO: middleware.ts
// PecuariaTech — Middleware Global (UI Protection Only)
// APIs internas e públicas ficam 100% livres

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ================================
// ROTAS PÚBLICAS (UI)
// ================================
const ROTAS_PUBLICAS = [
  "/login",
  "/planos",
  "/checkout",
];

// ================================
// MIDDLEWARE GLOBAL
// ================================
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --------------------------------
  // 1️⃣ LIBERAR TODAS AS APIs
  // --------------------------------
  // ⚠️ Middleware NÃO deve proteger API
  // (CFO, IA, cron, alertas, webhooks, etc.)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // --------------------------------
  // 2️⃣ IGNORAR ASSETS DO NEXT
  // --------------------------------
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // --------------------------------
  // 3️⃣ DEV MODE LIBERADO
  // --------------------------------
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // --------------------------------
  // 4️⃣ ROTAS PÚBLICAS
  // --------------------------------
  if (ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota))) {
    return NextResponse.next();
  }

  // --------------------------------
  // 5️⃣ VERIFICA COOKIE DE SESSÃO SUPABASE
  // --------------------------------
  const tokenCookie = req.cookies
    .getAll()
    .find(
      (c) =>
        c.name.startsWith("sb-") &&
        c.name.includes("auth-token")
    );

  if (!tokenCookie) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // --------------------------------
  // 6️⃣ ACESSO AUTORIZADO
  // --------------------------------
  return NextResponse.next();
}

// ================================
// MATCHER GLOBAL (SEGURO)
// ================================
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
