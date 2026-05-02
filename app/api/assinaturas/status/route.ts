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
    // ✅ NEXT 16 — obrigatório await
    const cookieStore = await cookies();

    // 🔥 CLIENT SSR CORRETO (FIX REAL AQUI)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          getAll() {
            return cookieStore.getAll().map((c) => ({
              name: c.name,
              value: c.value,
            }));
          },
          setAll(cookiesToSet) {
            // ⚠️ necessário para manter consistência SSR
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch (e) {
                // Em route handler pode falhar silenciosamente
              }
            });
          },
        },
      }
    );

    /* ============================
       1) SESSION (SSR REAL)
    ============================ */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError && authError.name !== "AuthSessionMissingError") {
      console.error("❌ AUTH ERROR:", authError);
    }

    if (!user) {
      console.log("⚠️ NO SESSION (cookie não chegou no SSR)");
      return NextResponse.json({
        ativo: false,
        reason: "no_session",
      });
    }

    console.log("👤 USER:", user.id, user.email);

    /* ============================
       2) ADMIN MASTER
    ============================ */

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

    // 🔴 REGRA Z
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

    return NextResponse.json({
      ativo: false,
      reason: "internal_error",
    });
  }
}