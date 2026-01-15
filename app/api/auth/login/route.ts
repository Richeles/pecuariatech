// app/api/auth/login/route.ts
// Login SSR CANÔNICO — PecuariaTech
// Objetivo: criar sessão Supabase via cookies HTTPOnly (SSR-friendly)
// Isso destrava middleware + /api/assinaturas/status

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "missing_credentials" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!url || !anon) {
      return NextResponse.json(
        { ok: false, error: "missing_env" },
        { status: 500 }
      );
    }

    // ✅ resposta que carregará cookies HTTPOnly
    const response = NextResponse.json({ ok: true }, { status: 200 });

    // ✅ Supabase SSR com cookies do request/response
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session) {
      return NextResponse.json(
        { ok: false, error: error?.message || "invalid_login" },
        { status: 401 }
      );
    }

    // ✅ importante: validar user SSR
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return NextResponse.json(
        { ok: false, error: "session_not_persisted" },
        { status: 500 }
      );
    }

    return response;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "login_exception" },
      { status: 500 }
    );
  }
}
