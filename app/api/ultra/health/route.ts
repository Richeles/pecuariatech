import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabase();

  return Response.json({
    ok: true,
    supabase: !!supabase,
    cookies: {
      session: supabase.cookies.get("session") ?? null,
    },
  });
}
