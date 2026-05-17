import {
  NextRequest,
  NextResponse,
} from "next/server";

/* =========================================================
   PECUARIATECH PROXY
   Next.js 16 Runtime
   Equação Y + Regra Z
========================================================= */

export function proxy(
  request: NextRequest
) {

  const pathname =
    request.nextUrl.pathname;

  console.log(
    "🛰️ PROXY:",
    pathname
  );

  /* =====================================================
     IGNORAR NEXT
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
     ROTAS PÚBLICAS
  ===================================================== */

  const publicRoutes = [

    "/",

    "/login",

    "/planos",

    "/checkout",
  ];

  const isPublic =
    publicRoutes.some(
      (route) =>

        pathname === route ||

        pathname.startsWith(
          `${route}/`
        )
    );

  if (isPublic) {

    return NextResponse.next();
  }

  /* =====================================================
     SSR COOKIE
  ===================================================== */

  const hasCookie =
    request.cookies
      .getAll()
      .length > 0;

  console.log(
    "🍪 SSR COOKIE:",
    hasCookie
  );

  /* =====================================================
     REGRA Z
  ===================================================== */

  if (!hasCookie) {

    return NextResponse.redirect(

      new URL(
        "/login",
        request.url
      )
    );
  }

  /* =====================================================
     OK
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