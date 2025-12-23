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
// MIDDLEWARE GLOBAL (SaaS)
// ================================
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // --------------------------------
  // 0️⃣ NUNCA INTERCEPTAR APIs (FONTE Y)
  // --------------------------------
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // --------------------------------
  // 1️⃣ DEV LIBERADO
  // --------------------------------
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // --------------------------------
  // 2️⃣ ROTAS PÚBLICAS (UI)
  // --------------------------------
  if (ROTAS_PUBLICAS.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // --------------------------------
  // 3️⃣ VERIFICAR SESSÃO
  // --------------------------------
  const tokenCookie = req.cookies
    .getAll()
    .find(
      (c) =>
        c.name.startsWith("sb-") &&
        c.name.includes("auth-token")
    );

  if (!tokenCookie?.value) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // --------------------------------
  // 4️⃣ VERIFICAR ASSINATURA ATIVA
  // --------------------------------
  try {
    const res = await fetch(
      `${origin}/api/assinaturas/status`,
      {
        headers: {
          Authorization: `Bearer ${tokenCookie.value}`,
        },
      }
    );

    const data = await res.json();

    if (!data?.ativo) {
      return NextResponse.redirect(
        new URL("/planos", req.url)
      );
    }
  } catch {
    return NextResponse.redirect(
      new URL("/planos", req.url)
    );
  }

  // --------------------------------
  // 5️⃣ ACESSO LIBERADO
  // --------------------------------
  return NextResponse.next();
}

// ================================
// MATCHER (APENAS UI)
// ================================
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/financeiro/:path*",
    "/rebanho/:path*",
    "/pastagem/:path*",
    "/planos/:path*",
  ],
};
