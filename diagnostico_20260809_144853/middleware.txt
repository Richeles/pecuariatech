// middleware.ts (raiz do projeto)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set(name, value)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, value, options)
        },
        remove(name, options) {
          request.cookies.set(name, '')
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  await supabase.auth.getSession()

  // ============================================================
  // LÓGICA ORIGINAL DO PROXY (mantida integralmente)
  // ============================================================

  if (request.method === "OPTIONS") return response

  const pathname = request.nextUrl.pathname
  console.log("🛰️ PROXY:", pathname)

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".")) {
    return response
  }
  if (pathname.startsWith("/api")) return response
  if (pathname === "/") {
    console.log("🏠 PUBLIC HOME")
    return response
  }
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/pt/login", request.url))
  }
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/pt/dashboard", request.url))
  }

  const locales = ["pt", "es"]
  const pathnameWithoutLocale = pathname.replace(/^\/(pt|es)/, "") || "/"
  const locale = locales.find((l) => pathname.startsWith(`/${l}`)) || "pt"

  console.log("🌎 LOCALE:", locale)

  const publicRoutes = ["/", "/login", "/planos", "/checkout", "/cadastro", "/reset-password"]
  const isPublic = publicRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  )

  if (isPublic) {
    console.log("🌐 PUBLIC ROUTE")
    return response
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.log("🚨 NO AUTH SESSION")
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  console.log("🧠 DASHBOARD SSR: AUTHORIZED")
  console.log("🟢 EQUAÇÃO Y: ATIVA")
  console.log("🟢 EQUAÇÃO Z: ATIVA")
  console.log("🟢 TRIÂNGULO 360: ATIVO")
  console.log("🟢 BIOLOGICAL RUNTIME: ONLINE")

  return response
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}