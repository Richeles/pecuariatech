// middleware.ts
// Paywall Oficial — PecuariaTech (SaaS Internacional)
// Equação Y aplicada: Supabase (âncora) → API status-server → Middleware → HUB
//
// ✅ Patch definitivo anti-loop:
// - Middleware NÃO usa Bearer token (não existe localStorage no server)
// - Middleware consulta /api/assinaturas/status-server via cookie/session
// - Login sempre permanece público e funcional
//
// ✅ SaaS por plano:
// - Middleware pode bloquear por nível/plano no futuro (gate fino)
// - Sem quebrar o HUB / sem retrabalho

import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset",
  "/reset-password",
  "/planos",
  "/checkout",

  // Assets e arquivos públicos comuns
  "/favicon.ico",
  "/pecuariatech.png",

  // ✅ APIs abertas read-only (se você quiser manter público)
  "/api/pastagem",
  "/api/rebanho",

  // ✅ Status pode existir público (mas middleware usará status-server)
  "/api/assinaturas/status",
  "/api/assinaturas/status-server",
];

// util: rota pública
function isPublic(pathname: string) {
  return (
    ROTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/favicon")
  );
}

// util: rota protegida (onde paywall aplica)
function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/financeiro") ||
    pathname.startsWith("/cfo") ||
    pathname.startsWith("/assinatura") ||
    pathname.startsWith("/api/financeiro") ||

    // ✅ IMPORTANTE: Engorda pode ser protegida por plano
    // (aqui já fica pronto — mesmo que hoje seja binário)
    pathname.startsWith("/dashboard/engorda") ||
    pathname.startsWith("/api/engorda")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // ✅ 1) Libera rotas públicas e assets SEM NENHUMA validação
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ✅ 2) Só aplica paywall em rotas protegidas
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  try {
    // ✅ 3) Consulta assinatura via endpoint SERVER-FRIENDLY (cookie/session)
    //    (Padrão internacional: Stripe/Paddle/MercadoPago)
    const res = await fetch(`${origin}/api/assinaturas/status-server`, {
      cache: "no-store",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    // Se status-server falhar: manda login com next (não quebra UX)
    if (!res.ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const data = await res.json();

    // ✅ Sem assinatura ativa: manda para Planos (SaaS UX)
    if (!data?.ativo) {
      const url = req.nextUrl.clone();
      url.pathname = "/planos";
      url.searchParams.set("reason", "assinatura_inativa");
      return NextResponse.redirect(url);
    }

    // ✅ (Gate fino por plano — pronto para SaaS por nível)
    // Nivel:
    // 1 = basico
    // 2 = pro (profissional/ultra/empresarial, conforme seu mapeamento)
    // 3 = premium dominus 360
    //
    // 🔒 Hoje você pode deixar binário (ativo true = entra)
    // 🔒 Depois refinamos travas por módulo (CFO só nível 3 etc)

    // Exemplo pronto (DESATIVADO por padrão):
    //
    // const nivel = Number(data?.nivel ?? 1);
    //
    // // CFO só premium:
    // if (pathname.startsWith("/cfo") && nivel < 3) {
    //   const url = req.nextUrl.clone();
    //   url.pathname = "/planos";
    //   url.searchParams.set("reason", "upgrade_premium");
    //   return NextResponse.redirect(url);
    // }

    // ✅ Assinatura ativa: libera acesso
    return NextResponse.next();
  } catch {
    // Em erro inesperado: manda login (seguro)
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

    // ✅ Engorda
    "/api/engorda/:path*",
  ],
};
