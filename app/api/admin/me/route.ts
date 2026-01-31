import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET() {

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {}
      }
    }
  )

  // sessão
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ is_admin: false })
  }

  // admin_users
  const { data } = await supabase
    .from("admin_users")
    .select("role, ativo")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .maybeSingle()

  const isAdmin = data?.role === "master"

  return NextResponse.json({ is_admin: isAdmin })
}
