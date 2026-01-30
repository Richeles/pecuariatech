// app/api/admin/usuarios/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // valida admin
  const { data: adminSession } = await supabase.auth.getUser(
    cookieStore.get("sb-access-token")?.value
  );

  if (!adminSession?.user?.email) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
  }

  const { data: admins } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", adminSession.user.email)
    .eq("ativo", true)
    .single();

  if (!admins) {
    return NextResponse.json(
      { error: "forbidden" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
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
}
