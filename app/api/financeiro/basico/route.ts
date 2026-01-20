import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

function supabaseSSR() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll();
        },
        setAll(cookiesToSet) {
          const store = cookies();
          cookiesToSet.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = supabaseSSR();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, reason: "no_session" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("financeiro_basico_view")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, reason: "db_error", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, row: data ?? {} });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, reason: "internal_error", message: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
