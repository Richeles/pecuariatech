// =========================================================
// PecuariaTech Enterprise Runtime
// Proxy SSR Canonical ULTRA
// Equação Y + Regra Z + Triângulo 360
// Runtime SaaS estabilizado
// =========================================================

import {
  NextRequest,
  NextResponse,
} from "next/server";

/* =========================================================
   PUBLIC FILE
========================================================= */

const PUBLIC_FILE =
  /\.(.*)$/;

/* =========================================================
   PROXY
========================================================= */

export function proxy(
  req: NextRequest
) {

  const {
    pathname,
  } = req.nextUrl;

  console.log(
    "🛰️ PROXY:",
    pathname
  );

  /* =====================================================
     IGNORAR RUNTIME
  ===================================================== */

  if (

    pathname.startsWith(
      "/_next"
    )

    ||

    pathname.startsWith(
      "/favicon"
    )

    ||

    pathname.startsWith(
      "/images"
    )

    ||

    pathname.startsWith(
      "/icons"
    )

    ||

    pathname.startsWith(
      "/api"
    )

    ||

    PUBLIC_FILE.test(
      pathname
    )
  ) {

    return NextResponse.next();
  }

  /* =====================================================
     LOCALE CLEAN
  ===================================================== */

  if (
    pathname === "/pt"
    ||
    pathname === "/es"
  ) {

    const url =
      req.nextUrl.clone();

    url.pathname =
      "/planos";

    return NextResponse.redirect(
      url
    );
  }

  if (

    pathname.startsWith("/pt/")
    ||

    pathname.startsWith("/es/")
  ) {

    const cleanPath =
      pathname
        .replace("/pt", "")
        .replace("/es", "");

    const url =
      req.nextUrl.clone();

    url.pathname =
      cleanPath || "/";

    return NextResponse.redirect(
      url
    );
  }

  /* =====================================================
     COOKIES SSR SUPABASE
  ===================================================== */

  const allCookies =
    req.cookies.getAll();

  const hasSupabaseCookie =

    allCookies.some(
      (cookie) =>

        cookie.name.includes(
          "auth-token"
        )
    );

  console.log(
    "🍪 SSR COOKIE:",
    hasSupabaseCookie
  );

  /* =====================================================
     ROTAS
  ===================================================== */

  const isLogin =
    pathname === "/login";

  const isCadastro =
    pathname === "/cadastro";

  const isDashboard =
    pathname.startsWith(
      "/dashboard"
    );

  const isPublicPage =

    pathname === "/"
    ||

    pathname === "/planos"
    ||

    pathname === "/sobre"
    ||

    pathname === "/contato";

  /* =====================================================
     REGRA Z
     SEM COOKIE -> LOGIN
  ===================================================== */

  if (
    !hasSupabaseCookie
    &&
    isDashboard
  ) {

    console.log(
      "🔴 NO SESSION"
    );

    const url =
      req.nextUrl.clone();

    url.pathname =
      "/login";

    return NextResponse.redirect(
      url
    );
  }

  /* =====================================================
     LOGIN/CADASTRO
     COM COOKIE -> DASHBOARD
  ===================================================== */

  if (

    hasSupabaseCookie

    &&

    (
      isLogin
      ||
      isCadastro
    )
  ) {

    console.log(
      "🟢 SESSION OK"
    );

    const url =
      req.nextUrl.clone();

    url.pathname =
      "/dashboard";

    return NextResponse.redirect(
      url
    );
  }

  /* =====================================================
     CACHE SAFE
  ===================================================== */

  const response =
    NextResponse.next();

  response.headers.set(
    "x-pecuariatech-runtime",
    "proxy-ultra"
  );

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );

  return response;
}

/* =========================================================
   MATCHER
========================================================= */

export const config = {

  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};