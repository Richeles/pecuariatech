// CAMINHO: middleware.ts
// Middleware Global — UI + Proteção
// CFO interno bypassado com header seguro

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
  // 🔓 0️⃣ BYPASS INTERNO (CFO)
  // --------------------------------
  if (req.headers.get("x-internal-call") === "cfo-monitorar") {
    return NextResponse.next();
  }

  // --------------------------------
  // 1️⃣ IGNORAR TODAS AS APIs
  // --------------------------------
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // --------------------------------
  // 2️⃣ IGNORAR ASSETS
  // --------------------------------
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // --------------------------------
  // 3️⃣ DEV LIBERADO
  // --------------------------------
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // --------------------------------
  // 4️⃣ ROTAS PÚBLICAS
  // --------------------------------
  if (ROTAS_PUBLICAS.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // --------------------------------
  // 5️⃣ VERIFICAR SESSÃO (COOKIE)
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
  // 6️⃣ ACESSO LIBERADO
  // --------------------------------
  return NextResponse.next();
}

// ================================
// MATCHER GLOBAL
// ================================
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
