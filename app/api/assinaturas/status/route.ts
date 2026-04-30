// TESTE GIT
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
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
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

    if (authError && authError.name !== "AuthSessionMissingError") {
      console.error("❌ AUTH ERROR:", authError);
    }

    if (!user) {
      return NextResponse.json({
        ativo: false,
        reason: "no_session",
      });
    }

    console.log("👤 USER:", user.id, user.email);

    /* ============================
       2) ADMIN MASTER (BLINDADO)
    ============================ */

    // 🔥 fallback direto por email (NÃO DEPENDE DE TABELA)
    if (user.email === "pecuariatech2026@gmail.com") {
      return NextResponse.json({
        ativo: true,
        plano: "master",
        nivel: 999,
        beneficios: FULL_ACCESS,
        is_admin: true,
        reason: "admin_email_override",
      });
    }

    // 🔥 validação por tabela (secundária)
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("role", "master")
      .eq("ativo", true)
      .maybeSingle();

    if (adminError) {
      console.warn("⚠️ ADMIN CHECK ERROR:", adminError);
    }

    if (admin) {
      return NextResponse.json({
        ativo: true,
        plano: "master",
        nivel: 999,
        beneficios: FULL_ACCESS,
        is_admin: true,
        reason: "admin_override",
      });
    }

    /* ============================
       3) ASSINATURA
    ============================ */

    const { data: assinatura, error: subError } = await supabase
      .from("assinatura_ativa_view")
      .select("plano_nome, plano_nivel, status")
      .eq("user_id", user.id)
      .maybeSingle();

    // 🔴 REGRA Z → erro técnico nunca vira bloqueio
    if (subError) {
      console.error("❌ ERRO ASSINATURA:", subError);

      return NextResponse.json({
        ativo: false,
        reason: "internal_error",
      });
    }

    const isAtiva =
      assinatura?.status === "ativa" ||
      assinatura?.status === "ativo";

    if (!assinatura || !isAtiva) {
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
      is_admin: false,
      reason: "ok",
    });

  } catch (err) {
    console.error("💥 ERRO CRÍTICO:", err);

    // 🔴 REGRA Z
    return NextResponse.json({
      ativo: false,
      reason: "internal_error",
    });
  }
}