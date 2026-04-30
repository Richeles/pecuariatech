import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export type Lang = "pt" | "es";

export async function getLangFromServer(): Promise<Lang> {
  try {
    const cookieStore = await cookies();

    // 1️⃣ COOKIE (PRIORIDADE)
    const cookieLang = cookieStore.get("lang")?.value;
    if (cookieLang === "es") return "es";

    // 2️⃣ USER PROFILE (SUPABASE)
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("lang")
          .eq("id", user.id)
          .single();

        if (data?.lang === "es") return "es";
      }
    } catch {}

    // 3️⃣ DEFAULT
    return "pt";
  } catch {
    return "pt";
  }
}