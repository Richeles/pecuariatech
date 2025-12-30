// middleware.ts
// Paywall REAL — Produção
// Fonte Y: Supabase + Assinaturas
// Login e Reset protegidos contra bloqueio indevido

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ================================
// ROTAS 100% PÚBLICAS (NUNCA BLOQUEAR)
// ================================
const ROTAS_PUBLICAS = [
  "/",
  "/login",
  "/reset-password",
  "/planos",
  "/checkout",
  "/sucesso",
  "/erro",
  "/api/checkout",
  "/api/checkout/preference",
  "/api/checkout/webhook",
  "/api/trial",
  "/api/auth",
];

// ================================
// MIDDLEWARE
// ================================
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Libera rotas públicas, assets e Next internals
  if (
    ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Obtém token do Supabase (cookie correto v2)
  const accessToken =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("supabase-auth-token")?.value;

  // 3️⃣ Sem token → redireciona para login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4️⃣ Valida assinatura SOMENTE após sessão existir
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/assinatura/status`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Falha de validação → planos
    if (!res.ok) {
      return NextResponse.redirect(new URL("/planos", req.url));
    }

    const data = await res.json();

    // Assinatura inativa → planos
    if (data?.status !== "ativa") {
      return NextResponse.redirect(new URL("/planos", req.url));
    }

    // Tudo OK
    return NextResponse.next();
  } catch (err) {
    console.error("Middleware erro:", err);
    return NextResponse.redirect(new URL("/erro", req.url));
  }
}

// ================================
// ROTAS PROTEGIDAS PELO PAYWALL
// ================================
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
