// middleware.ts
// Paywall Oficial — PecuariaTech
// Equação Y aplicada (API canônica liberada)
// Patch anti-loop: login nunca quebra por dependência de Bearer token

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

  // ✅ Importante: permitir status sem travar público
  // (o middleware só aplica em matcher, mas essa liberação evita confusão futura)
  "/api/assinaturas/status",
];

function isPublic(pathname: string) {
  return (
    ROTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/pecuariatech.png")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // ✅ 1) Libera rotas públicas e assets
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ✅ 2) Protege apenas as áreas privadas (garantia extra)
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/assinatura") ||
    pathname.startsWith("/api/financeiro");

  if (!isProtected) {
    return NextResponse.next();
  }

  try {
    // ✅ 3) Checa assinatura (paywall)
    // IMPORTANTÍSSIMO:
    // - middleware roda no server
    // - não tem localStorage
    // - então status precisa ser consultado de modo "server-friendly"
    const res = await fetch(`${origin}/api/assinaturas/status`, {
      cache: "no-store",
      // mantém cookies do request (se houver)
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    // ✅ Se status falhar (401/500), redireciona pro login (rota pública)
    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const data = await res.json();

    // ✅ Se assinatura inativa: manda para /planos (experiência SaaS)
    if (!data?.ativo) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    // ✅ OK: libera
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
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
