import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const { lang } = await req.json();

  // 🔒 validação
  if (!["pt", "es"].includes(lang)) {
    return NextResponse.json({ ok: false });
  }

  // 🍪 salva cookie (SSR FIRST)
  const cookieStore = await cookies();
  cookieStore.set("lang", lang, {
    path: "/",
    httpOnly: false,
  });

  // 🧠 salva no Supabase (opcional)
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
      await supabase
        .from("profiles")
        .update({ lang })
        .eq("id", user.id);
    }
  } catch {
    // Regra Z: nunca quebrar UX
  }

  return NextResponse.json({ ok: true });
}