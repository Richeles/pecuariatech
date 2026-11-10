import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { is_admin: false },
        { status: 401 }
      );
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("role, ativo")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .maybeSingle();

    if (adminError || admin?.role !== "master") {
      return NextResponse.json(
        { is_admin: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      is_admin: true,
      role: "master",
    });
  } catch (error) {
    console.error("[ADMIN_ME]", error);

    return NextResponse.json(
      { is_admin: false, error: "internal_error" },
      { status: 500 }
    );
  }
}