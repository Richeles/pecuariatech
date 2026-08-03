// middleware.ts (raiz do projeto)
import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Cria a resposta padrão
  const res = NextResponse.next()

  // 2. 🔁 Sincroniza os cookies do Supabase (SSR ↔ CSR)
  const supabase = createMiddlewareClient({ req: request, res })
  await supabase.auth.getSession() // renova a sessão se necessário

  // ============================================================
  // LÓGICA ORIGINAL DO PROXY (mantida integralmente)
  // ============================================================

  // Ignorar OPTIONS
  if (request.method === "OPTIONS") {
    return res
  }

  const pathname = request.nextUrl.pathname

  console.log("🛰️ PROXY:", pathname)

  // Ignorar assets e Next internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".")) {
    return res
  }

  // Ignorar APIs (inclusive /api/upload-arquivo e /api/dashboard)
  if (pathname.startsWith("/api")) {
    return res
  }

  // Root público
  if (pathname === "/") {
    console.log("🏠 PUBLIC HOME")
    return res
  }

  // Redirecionar login legado
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/pt/login", request.url))
  }

  // Redirecionar dashboard legado
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/pt/dashboard", request.url))
  }

  // Locales
  const locales = ["pt", "es"]
  const pathnameWithoutLocale = pathname.replace(/^\/(pt|es)/, "") || "/"
  const locale = locales.find((l) => pathname.startsWith(/)) || "pt"

  console.log("🌎 LOCALE:", locale)

  // Rotas públicas
  const publicRoutes = ["/", "/login", "/planos", "/checkout", "/cadastro", "/reset-password"]
  const isPublic = publicRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(${route}/)
  )

  if (isPublic) {
    console.log("🌐 PUBLIC ROUTE")
    return res
  }

  // ============================================================
  // REGRA Z – AUTENTICAÇÃO (agora baseada na sessão real)
  // ============================================================
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.log("🚨 NO AUTH SESSION")
    return NextResponse.redirect(new URL(//login, request.url))
  }

  console.log("🧠 DASHBOARD SSR: AUTHORIZED")
  console.log("🟢 EQUAÇÃO Y: ATIVA")
  console.log("🟢 EQUAÇÃO Z: ATIVA")
  console.log("🟢 TRIÂNGULO 360: ATIVO")
  console.log("🟢 BIOLOGICAL RUNTIME: ONLINE")

  return res
}

export const config = {
  matcher: ["/((?!api|_next|.*\\\\.*).*)"],
}
