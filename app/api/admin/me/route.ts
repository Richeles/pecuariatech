import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ is_admin: false });
    }

    const { data } = await supabase
      .from("admin_users")
      .select("role, active")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ is_admin: false });
    }

    return NextResponse.json({ is_admin: true });

  } catch {
    return NextResponse.json({ is_admin: false });
  }
}
