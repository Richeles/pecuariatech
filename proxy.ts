// proxy.ts (raiz do projeto)
import { NextRequest, NextResponse } from "next/server";

/* =========================================================
   PECUARIATECH PROXY
   NEXT.JS 16 RUNTIME
   ULTRA PREMIUM BIOLOGICAL RUNTIME
   EQUAÇÃO Y + EQUAÇÃO Z + TRIÂNGULO 360
========================================================= */

export async function proxy(request: NextRequest) {
  // 🔥 Ignorar requisições OPTIONS (preflight CORS)
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  console.log("🛰️ PROXY:", pathname);

  // Ignorar Next / assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Ignorar APIs
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Root público
  if (pathname === "/") {
    console.log("🏠 PUBLIC HOME");
    return NextResponse.next();
  }

  // Redirecionar login legado
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/pt/login", request.url));
  }

  // Redirecionar dashboard legado
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/pt/dashboard", request.url));
  }

  // Locales
  const locales = ["pt", "es"];
  const pathnameWithoutLocale = pathname.replace(/^\/(pt|es)/, "") || "/";
  const locale = locales.find((l) => pathname.startsWith(`/${l}`)) || "pt";

  console.log("🌎 LOCALE:", locale);

  // Rotas públicas
  const publicRoutes = ["/", "/login", "/planos", "/checkout", "/cadastro", "/reset-password"];
  const isPublic = publicRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );

  if (isPublic) {
    console.log("🌐 PUBLIC ROUTE");
    return NextResponse.next();
  }

  // ============================================================
  // REGRA Z – AUTENTICAÇÃO (SEM PLANO)
  // ============================================================
  const cookies = request.cookies.getAll();
  const hasSupabaseCookie = cookies.some(
    (cookie) => cookie.name.includes("sb-") || cookie.name.includes("supabase")
  );

  console.log("🍪 SSR COOKIE:", hasSupabaseCookie);

  if (!hasSupabaseCookie) {
    console.log("🚨 NO AUTH COOKIE");
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  console.log("🧠 DASHBOARD SSR: AUTHORIZED");
  console.log("🟢 EQUAÇÃO Y: ATIVA");
  console.log("🟢 EQUAÇÃO Z: ATIVA");
  console.log("🟢 TRIÂNGULO 360: ATIVO");
  console.log("🟢 BIOLOGICAL RUNTIME: ONLINE");

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};