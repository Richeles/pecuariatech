import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {}
        }
      }
    );

    // 1) Sessão
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "no_session" },
        { status: 401 }
      );
    }

    // 2) Admin por EMAIL (schema real)
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, email, ativo")
      .eq("email", user.email)
      .eq("ativo", true)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json(
        { error: "not_admin" },
        { status: 403 }
      );
    }

    // 3) Planos
    const { data, error } = await supabase
      .from("planos")
      .select("id, nome, nivel, preco, ativo")
      .order("preco");

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (err) {
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
