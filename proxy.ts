import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

// ✅ SOMENTE PT E ES
const SUPPORTED_LOCALES = ["pt", "es"];

const DEFAULT_LOCALE = "pt";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ===============================
  // 🔒 NUNCA TOCAR API
  // ===============================
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ===============================
  // 🔒 ARQUIVOS ESTÁTICOS
  // ===============================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ===============================
  // 🌍 JÁ POSSUI LOCALE?
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
  const cookieLang = req.cookies.get("lang")?.value;

  let locale = DEFAULT_LOCALE;

  if (cookieLang === "es") {
    locale = "es";
  }

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