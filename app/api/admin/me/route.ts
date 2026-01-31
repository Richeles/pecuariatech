import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ is_admin: false })
  }

  const { data } = await supabase
    .from("admin_users")
    .select("role, ativo")
    .eq("user_id", user.id)
    .single()

  const isAdmin =
    data?.ativo === true &&
    (data?.role === "master" || data?.role === "admin")

  return NextResponse.json({ is_admin: isAdmin })
}
