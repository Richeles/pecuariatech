import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getServerAdmin() {
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
          // leitura apenas (SSR)
        }
      }
    }
  );

  // ============================
  // 1) VALIDAR SESSÃO
  // ============================
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { is_admin: false };
  }

  // ============================
  // 2) VERIFICAR ADMIN MASTER
  // ============================
  const { data: admin } = await supabase
    .from("admin_users")
    .select("role, ativo")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (!admin) {
    return { is_admin: false };
  }

  return {
    is_admin: String(admin.role).toLowerCase() === "master"
  };
}