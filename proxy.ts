import {
  NextRequest,
  NextResponse,
} from "next/server";

/* =========================================================
   PECUARIATECH PROXY
   NEXT.JS 16 RUNTIME
   ULTRA PREMIUM BIOLOGICAL RUNTIME
   EQUAÇÃO Y + EQUAÇÃO Z + TRIÂNGULO 360
========================================================= */

export function proxy(
  request: NextRequest
) {

  /* =====================================================
     PATHNAME
  ===================================================== */

  const pathname =
    request.nextUrl.pathname;

  console.log(
    "🛰️ PROXY:",
    pathname
  );

  /* =====================================================
     IGNORAR NEXT / ASSETS
  ===================================================== */

  if (

    pathname.startsWith("/_next") ||

    pathname.startsWith("/favicon.ico") ||

    pathname.includes(".")

  ) {

    return NextResponse.next();
  }

  /* =====================================================
     IGNORAR APIs
  ===================================================== */

  if (
    pathname.startsWith("/api")
  ) {

    return NextResponse.next();
  }

  /* =====================================================
     ROOT PÚBLICO
     HOME SAAS
  ===================================================== */

  if (pathname === "/") {

    console.log(
      "🏠 PUBLIC HOME"
    );

    return NextResponse.next();
  }

  /* =====================================================
     REDIRECT LOGIN
  ===================================================== */

  if (pathname === "/login") {

    return NextResponse.redirect(

      new URL(
        "/pt/login",
        request.url
      )
    );
  }

  /* =====================================================
     REDIRECT DASHBOARD LEGADO
  ===================================================== */

  if (pathname === "/dashboard") {

    return NextResponse.redirect(

      new URL(
        "/pt/dashboard",
        request.url
      )
    );
  }

  /* =====================================================
     LOCALES
  ===================================================== */

  const locales = [

    "pt",

    "es",
  ];

  const pathnameWithoutLocale =
    pathname.replace(
      /^\/(pt|es)/,
      ""
    ) || "/";

  /* =====================================================
     DETECTAR LOCALE
  ===================================================== */

  const locale =
    locales.find(

      (l) =>

        pathname.startsWith(`/${l}`)
    ) || "pt";

  console.log(
    "🌎 LOCALE:",
    locale
  );

  /* =====================================================
     ROTAS PÚBLICAS
  ===================================================== */

  const publicRoutes = [

    "/",

    "/login",

    "/planos",

    "/checkout",

    "/cadastro",

    "/reset-password",
  ];

  const isPublic =
    publicRoutes.some(

      (route) =>

        pathnameWithoutLocale === route ||

        pathnameWithoutLocale.startsWith(
          `${route}/`
        )
    );

  /* =====================================================
     🔥 LOG DE DIAGNÓSTICO PARA CHECKOUT
  ===================================================== */

  if (pathnameWithoutLocale === "/checkout") {
    console.log("🔍 CHECKOUT DETECTADO");
    console.log("🔍 pathname original:", pathname);
    console.log("🔍 pathname sem locale:", pathnameWithoutLocale);
    console.log("🔍 locale detectado:", locale);
    console.log("🔍 isPublic:", isPublic);
  }

  /* =====================================================
     LIBERAR ROTAS PÚBLICAS
  ===================================================== */

  if (isPublic) {

    console.log(
      "🌐 PUBLIC ROUTE"
    );

    return NextResponse.next();
  }

  /* =====================================================
     COOKIE SSR REAL
  ===================================================== */

  const cookies =
    request.cookies.getAll();

  const hasSupabaseCookie =
    cookies.some(

      (cookie) =>

        cookie.name.includes(
          "sb-"
        ) ||

        cookie.name.includes(
          "supabase"
        )
    );

  console.log(
    "🍪 SSR COOKIE:",
    hasSupabaseCookie
  );

  /* =====================================================
     🔥 LOG DE COOKIE PARA CHECKOUT
  ===================================================== */

  if (pathnameWithoutLocale === "/checkout") {
    console.log("🔍 CHECKOUT - hasSupabaseCookie:", hasSupabaseCookie);
    console.log("🔍 CHECKOUT - cookies encontrados:", cookies.map(c => c.name));
  }

  /* =====================================================
     REGRA Z
     SEM COOKIE -> LOGIN
  ===================================================== */

  if (!hasSupabaseCookie) {

    console.log(
      "🚨 NO AUTH COOKIE"
    );

    return NextResponse.redirect(

      new URL(
        `/${locale}/login`,
        request.url
      )
    );
  }

  /* =====================================================
     DASHBOARD PROTECTED
  ===================================================== */

  if (

    pathname.includes(
      "/dashboard"
    )

  ) {

    console.log(
      "🧠 DASHBOARD SSR:",
      "AUTHORIZED"
    );
  }

  /* =====================================================
     GOVERNANÇA
  ===================================================== */

  console.log(
    "🟢 EQUAÇÃO Y:",
    "ATIVA"
  );

  console.log(
    "🟢 EQUAÇÃO Z:",
    "ATIVA"
  );

  console.log(
    "🟢 TRIÂNGULO 360:",
    "ATIVO"
  );

  console.log(
    "🟢 BIOLOGICAL RUNTIME:",
    "ONLINE"
  );

  /* =====================================================
     NEXT
  ===================================================== */

  return NextResponse.next();
}

/* =========================================================
   MATCHER
========================================================= */

export const config = {

  matcher: [

    "/((?!api|_next|.*\\..*).*)",
  ],
};