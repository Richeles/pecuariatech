import {
  NextRequest,
  NextResponse,
} from "next/server";

/* =========================================================
   PECUARIATECH PROXY
   Next.js 16 Runtime
   Ultra Premium Biological Runtime
   Equação Y + Equação Z + Triângulo 360
   AUTH SSR + i18n + Dashboard HUB
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
     REGRA Z
     SEM COOKIE -> LOGIN
  ===================================================== */

  if (!hasSupabaseCookie) {

    console.log(
      "🚨 NO AUTH COOKIE"
    );

    const loginUrl =
      new URL(
        `/${locale}/login`,
        request.url
      );

    return NextResponse.redirect(
      loginUrl
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

    /*
     * Tudo EXCETO:
     * - api
     * - _next
     * - arquivos
     */

    "/((?!api|_next|.*\\..*).*)",
  ],
};