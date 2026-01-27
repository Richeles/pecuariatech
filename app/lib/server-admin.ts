import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Verifica se o usuário autenticado é Admin Master.
 * Uso exclusivo em Server Components.
 */
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
          /* noop - leitura apenas */
        }
      }
    }
  );

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      isAdmin: false
    };
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  return {
    isAdmin: Boolean(adminRow)
  };
}