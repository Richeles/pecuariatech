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

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ is_admin: false });
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("role, ativo")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin || admin.ativo !== true) {
      return NextResponse.json({ is_admin: false });
    }

    return NextResponse.json({
      is_admin: true,
      role: admin.role
    });

  } catch (err) {
    console.error("ADMIN_ME_ERROR", err);
    return NextResponse.json({ is_admin: false });
  }
}
