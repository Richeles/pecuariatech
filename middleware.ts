import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas
  const publicRoutes = ["/login", "/planos", "/"];
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Somente proteger estas áreas
  const protectedRoutes = ["/dashboard", "/financeiro", "/rebanho"];
  if (!protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Token Supabase (cookie padrão)
  const accessToken =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("sb-access-token.0")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Consultar status central
  const statusResp = await fetch(
    `${req.nextUrl.origin}/api/assinatura/status`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!statusResp.ok) {
    return NextResponse.redirect(new URL("/planos", req.url));
  }

  const status = await statusResp.json();

  // Regras finais
  if (status.status === "anonimo" || status.status === "trial_expirado") {
    return NextResponse.redirect(new URL("/planos", req.url));
  }

  return NextResponse.next();
}

// Matcher oficial
export const config = {
  matcher: ["/dashboard/:path*", "/financeiro/:path*", "/rebanho/:path*"],
};
