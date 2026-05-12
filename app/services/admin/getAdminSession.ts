// app/services/admin/getAdminSession.ts
// PecuariaTech — Admin Runtime Service
// Equação Y + Regra Z

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export type AdminSession = {
  is_admin: boolean;

  role?: string;

  email?: string;
};

function makeSupabase() {

  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const service =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !service) {

    throw new Error(
      "missing_env_supabase"
    );
  }

  return createClient(
    url,
    service,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function getAdminSession():
Promise<AdminSession> {

  try {

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "sb-access-token"
      )?.value;

    if (!token) {

      return {
        is_admin: false,
      };
    }

    const supabase =
      makeSupabase();

    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      authError ||
      !authData?.user
    ) {

      return {
        is_admin: false,
      };
    }

    const user =
      authData.user;

    const {
      data: admin,
      error,
    } = await supabase
      .from("admin_users")
      .select(
        "role,email,ativo"
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "ativo",
        true
      )
      .maybeSingle();

    if (
      error ||
      !admin
    ) {

      return {
        is_admin: false,
      };
    }

    return {

      is_admin: true,

      role:
        admin.role ??
        "admin",

      email:
        admin.email ??
        user.email,
    };

  } catch {

    return {
      is_admin: false,
    };
  }
}