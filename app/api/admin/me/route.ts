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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ is_admin: false });
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("role, ativo")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .maybeSingle();

    return NextResponse.json({
      is_admin: String(admin?.role ?? "").toLowerCase() === "master"
    });

  } catch (e) {
    console.error("ADMIN_ME_ERROR", e);
    return NextResponse.json({ is_admin: false });
  }
}
