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

    // =========================
    // Sessão
    // =========================
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "no_session" },
        { status: 401 }
      );
    }

    // =========================
    // Admin via EMAIL
    // =========================
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .eq("ativo", true)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json(
        { error: "not_admin" },
        { status: 403 }
      );
    }

    // =========================
    // Buscar planos
    // =========================
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

  } catch {
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
