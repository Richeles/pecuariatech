// CAMINHO: middleware.ts
// Next.js 16 — Paywall Real por Plano (Opção A)
// Middleware ajustado para liberar /planos e checkout

import { NextRequest, NextResponse } from "next/server";

// ==============================
// CONFIGURAÇÃO CENTRAL (EQUAÇÃO Y)
// ==============================

// Rotas SEM paywall (PÚBLICAS)
const ROTAS_LIVRES = [
  "/",
  "/inicio",
  "/login",
  "/reset-password",
  "/planos",
  "/checkout",
  "/sucesso",
  "/erro",
  "/api",
  "/_next",
  "/favicon.ico",
];

// Rotas COM paywall
const ROTAS_PROTEGIDAS = [
  "/dashboard",
  "/financeiro",
  "/rebanho",
  "/pastagem",
  "/cfo",
  "/ultra",
];

// Plano mínimo exigido (quando paywall estiver ativo)
const PLANO_MINIMO = "profissional";

// ==============================
// FUNÇÕES AUXILIARES
// ==============================

function rotaLivre(pathname: string) {
  return ROTAS_LIVRES.some((rota) => pathname.startsWith(rota));
}

function rotaProtegida(pathname: string) {
  return ROTAS_PROTEGIDAS.some((rota) => pathname.startsWith(rota));
}

// ==============================
// MIDDLEWARE
// ==============================

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Ignora arquivos estáticos explicitamente
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Libera rotas públicas
  if (rotaLivre(pathname)) {
    return NextResponse.next();
  }

  // 3️⃣ Se não for rota protegida, libera
  if (!rotaProtegida(pathname)) {
    return NextResponse.next();
  }

  /**
   * 4️⃣ PAYWALL (MODO CONTROLADO)
   *
   * Enquanto o login real está pausado:
   * - Plano vem de cookie
   * - Depois será ligado ao user_id
   */
  const planoAtual =
    req.cookies.get("plano_ativo")?.value ?? "nenhum";

  // 5️⃣ Sem plano → redireciona para /planos
  if (planoAtual === "nenhum") {
    const url = req.nextUrl.clone();
    url.pathname = "/planos";
    return NextResponse.redirect(url);
  }

  // 6️⃣ Hierarquia de planos
  const ordemPlanos = [
    "basico",
    "profissional",
    "ultra",
    "empresarial",
    "dominus360",
  ];

  const nivelAtual = ordemPlanos.indexOf(planoAtual);
  const nivelMinimo = ordemPlanos.indexOf(PLANO_MINIMO);

  if (nivelAtual === -1 || nivelAtual < nivelMinimo) {
    const url = req.nextUrl.clone();
    url.pathname = "/planos";
    return NextResponse.redirect(url);
  }

  // 7️⃣ Plano válido → acesso liberado
  return NextResponse.next();
}

// ==============================
// MATCHER (CRÍTICO)
// ==============================

export const config = {
  matcher: [
    // Aplica middleware a TODAS as rotas
    // EXCETO arquivos estáticos e rotas internas
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
