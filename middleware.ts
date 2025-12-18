import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ================================
// ROTAS PÚBLICAS
// ================================
const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/planos",
  "/checkout",
  "/api",
];

// ================================
// MIDDLEWARE GLOBAL (SaaS)
// ================================
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // --------------------------------
  // 1️⃣ DEV LIBERADO
  // --------------------------------
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // --------------------------------
  // 2️⃣ ROTAS PÚBLICAS
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

    if (!data.ativo) {
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
// MATCHER
// ================================
export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
