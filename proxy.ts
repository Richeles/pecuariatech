// proxy.ts
// PecuariaTech Enterprise Runtime
// Runtime SaaS estabilizado
// Sem locale routing

import {
  NextRequest,
  NextResponse,
} from "next/server";

/* =====================================================
   PUBLIC
===================================================== */

const PUBLIC_FILE =
  /\.(.*)$/;

/* =====================================================
   PROXY
===================================================== */

export function proxy(
  req: NextRequest
) {

  const {
    pathname,
  } = req.nextUrl;

  /* ==========================================
     IGNORAR
  ========================================== */

  if (

    pathname.startsWith(
      "/_next"
    ) ||

    pathname.startsWith(
      "/api"
    ) ||

    pathname.startsWith(
      "/favicon"
    ) ||

    PUBLIC_FILE.test(
      pathname
    )
  ) {

    return NextResponse.next();
  }

  /* ==========================================
     LIMPEZA LOCALE ANTIGO
  ========================================== */

  if (

    pathname === "/pt" ||
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

    pathname.startsWith("/pt/") ||
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

  /* ==========================================
     AUTH
  ========================================== */

  const accessToken =
    req.cookies.get(
      "sb-access-token"
    )?.value;

  const hasSession =
    Boolean(
      accessToken
    );

  /* ==========================================
     ROTAS
  ========================================== */

  const isLogin =
    pathname ===
    "/login";

  const isCadastro =
    pathname ===
    "/cadastro";

  const isDashboard =
    pathname.startsWith(
      "/dashboard"
    );

  /* ==========================================
     REGRA Z
  ========================================== */

  if (
    !hasSession &&
    isDashboard
  ) {

    const url =
      req.nextUrl.clone();

    url.pathname =
      "/login";

    return NextResponse.redirect(
      url
    );
  }

  /* ==========================================
     LOGIN/CADASTRO
  ========================================== */

  if (
    hasSession &&
    (
      isLogin ||
      isCadastro
    )
  ) {

    const url =
      req.nextUrl.clone();

    url.pathname =
      "/dashboard";

    return NextResponse.redirect(
      url
    );
  }

  /* ==========================================
     NEXT
  ========================================== */

  return NextResponse.next();
}

/* =====================================================
   MATCHER
===================================================== */

export const config = {

  matcher: [
    "/((?!_next|favicon.ico).*)",
  ],
};