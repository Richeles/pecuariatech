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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "no_session" },
        { status: 401 }
      );
    }

    // 2) Verifica admin
    const { data: admin } = await supabase
      .from("admin_users")
      .select("role, ativo")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json(
        { error: "not_admin" },
        { status: 403 }
      );
    }

    // 3) Lista usuários (via service role embutido no Supabase backend)
    const service = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {}
        }
      }
    );

    const { data, error } = await service
      .from("auth.users")
      .select("id,email,created_at")
      .order("created_at", { ascending: false });

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
