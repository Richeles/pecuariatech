// Paywall Oficial — PecuariaTech (Produção)
// Next.js 16 | App Router
// Middleware BLOQUEADOR (não redireciona para vendas)

import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/planos",
  "/checkout",
];

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1️⃣ Liberar rotas públicas
  if (
    ROTAS_PUBLICAS.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    ) ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const data = await res.json();

    // 🚫 NÃO REDIRECIONA PARA /planos
    if (!data?.ativo) {
      return new NextResponse(
        JSON.stringify({
          error: "ASSINATURA_INATIVA",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
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
