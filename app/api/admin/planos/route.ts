import { NextResponse } from "next/server"

export async function GET(req: Request) {

  // 🔑 1) ORÁCULO ÚNICO
  const adminRes = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/me`,
    {
      headers: {
        cookie: req.headers.get("cookie") || ""
      }
    }
  )

  const adminData = await adminRes.json()

  if (!adminData?.is_admin) {
    return NextResponse.json(
      { error: "not_admin" },
      { status: 403 }
    )
  }

  // 📦 2) ACESSO A DADOS
  const { cookies } = await import("next/headers")
  const { createServerClient } = await import("@supabase/ssr")

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        }
      }
    }
  )

  const { data } = await supabase
    .from("planos")
    .select("id, nome, nivel, preco, ativo")
    .order("preco")

  return NextResponse.json(data || [])
}
