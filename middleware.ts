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
// MIDDLEWARE GLOBAL (UI ONLY)
// ================================
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --------------------------------
  // 1️⃣ IGNORAR QUALQUER API
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
  // 5️⃣ VERIFICAR SESSÃO (COOKIE PURO)
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
// MATCHER — GLOBAL SEGURO
// ================================
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
