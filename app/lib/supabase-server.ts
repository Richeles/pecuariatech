// app/lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient(token?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      },
    }
  );
}
