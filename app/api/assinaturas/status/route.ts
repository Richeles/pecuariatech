import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function isAtiva(status?: string | null) {
  const s = String(status ?? "").toLowerCase();
  return s === "ativa" || s === "ativo" || s === "active";
}

export async function GET() {
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
          setAll() {}
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        ativo: false,
        reason: "no_session"
      });
    }

    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!isAtiva(assinatura?.status)) {
      return NextResponse.json({
        ativo: false,
        reason: "no_subscription"
      });
    }

    return NextResponse.json({
      ativo: true
    });

  } catch (e) {
    console.error("ASSINATURA_STATUS_ERROR", e);
    return NextResponse.json({
      ativo: false,
      reason: "internal_error"
    });
  }
}
