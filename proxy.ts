import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

const SUPPORTED_LOCALES = ["pt", "es", "en"];
const DEFAULT_LOCALE = "pt";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ===============================
  // 🔴 REGRA Z — NUNCA TOCAR API
  // ===============================
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // arquivos estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ===============================
  // 🌍 VERIFICAR SE JÁ TEM LOCALE
  // ===============================
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) =>
      pathname === `/${locale}` ||
      pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // ===============================
  // 🌍 DETECTAR IDIOMA
  // ===============================
  const acceptLang = req.headers.get("accept-language") || "";

  let locale = DEFAULT_LOCALE;

  if (acceptLang.includes("es")) locale = "es";
  else if (acceptLang.includes("en")) locale = "en";

  // ===============================
  // 🔁 REDIRECIONAR
  // ===============================
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};