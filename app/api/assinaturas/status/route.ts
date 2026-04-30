import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

const FULL_ACCESS = {
  rebanho: true,
  pastagem: true,
  engorda_base: true,
  engorda_ultra: true,
  financeiro: true,
  cfo: true,
  esg: true,
  multiusuario: true,
};

export async function GET() {
  console.log("🔥 /api/assinaturas/status EXECUTANDO");

  try {
    const cookieStore = await cookies(); // ✅ Next 16 obrigatório

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(), // ✅ SSR cookie-first
          setAll: () => {}, // read-only
        },
      }
    );

    /* ============================
       1) USER SESSION
    ============================ */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // ✅ AJUSTE LIMPO (remove ruído de log)
    if (authError && authError.name !== "AuthSessionMissingError") {
      console.error("❌ AUTH ERROR:", authError);
    }

    if (!user) {
      return NextResponse.json({
        ativo: false,
        reason: "no_session",
      });
    }

    console.log("👤 USER:", user.id);

    /* ============================
       2) ADMIN MASTER
    ============================ */

    const { data: admin } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("role", "master")
      .eq("ativo", true)
      .maybeSingle();

    if (admin) {
      return NextResponse.json({
        ativo: true,
        plano: "master",
        nivel: 999,
        beneficios: FULL_ACCESS,
        reason: "admin_override",
      });
    }

    /* ============================
       3) ASSINATURA
    ============================ */

    const { data: assinatura } = await supabase
      .from("assinatura_ativa_view")
      .select("plano_nome, plano_nivel")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!assinatura) {
      return NextResponse.json({
        ativo: false,
        reason: "no_subscription",
      });
    }

    /* ============================
       4) OK
    ============================ */

    return NextResponse.json({
      ativo: true,
      plano: assinatura.plano_nome,
      nivel: assinatura.plano_nivel,
      beneficios: FULL_ACCESS,
      reason: "ok",
    });

  } catch (err) {
    console.error("💥 ERRO CRÍTICO:", err);

    // 🔴 REGRA Z → nunca mandar erro técnico para planos
    return NextResponse.json({
      ativo: false,
      reason: "internal_error",
    });
  }
}