import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

export async function getAdminUser() {
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

          setAll() {
            // SSR READ ONLY
          },
        },
      }
    );

    // ======================================
    // AUTH
    // ======================================

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        is_admin: false,
      };
    }

    // ======================================
    // ADMIN
    // ======================================

    const { data: admin } = await supabase
      .from("admin_users")
      .select("role, ativo")
      .eq("email", user.email)
      .maybeSingle();

    if (!admin?.ativo) {
      return {
        is_admin: false,
      };
    }

    return {
      is_admin: true,
      role: admin.role ?? "admin",
    };

  } catch (error) {
    console.error(
      "Erro admin service:",
      error
    );

    return {
      is_admin: false,
    };
  }
}