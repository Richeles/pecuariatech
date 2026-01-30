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

    // valida sessão
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "no_session" }, { status: 401 });
    }

    // valida admin
    const { data: admin } = await supabase
      .from("admin_users")
      .select("role, ativo")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .maybeSingle();

    if (admin?.role !== "master") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // busca assinaturas
    const { data } = await supabase
      .from("assinaturas")
      .select("user_id, status, plano, nivel, created_at")
      .order("created_at", { ascending: false });

    return NextResponse.json(data ?? []);

  } catch {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
