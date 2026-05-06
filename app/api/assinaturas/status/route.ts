import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

// 🔥 MATRIZ DE BENEFÍCIOS BASEADA EM NÍVEL (Z)
function getBeneficios(nivel: number) {
  if (nivel >= 999) return { all: true };

  return {
    rebanho: true,
    pastagem: true,
    financeiro: nivel >= 2,
    cfo: nivel >= 3,
    engorda_ultra: nivel >= 3,
    multiusuario: nivel >= 4,
    esg: nivel >= 3,
  };
}

export async function GET() {
  console.log("🔥 /api/assinaturas/status EXECUTANDO");

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((c) => ({
              name: c.name,
              value: c.value,
            }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {}
            });
          },
        },
      }
    );

    /* ============================
       1) SESSION
    ============================ */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        ativo: false,
        reason: "no_session",
      });
    }

    /* ============================
       2) ADMIN MASTER
    ============================ */
    if (user.email === "pecuariatech2026@gmail.com") {
      return NextResponse.json({
        ativo: true,
        plano: "master",
        nivel: 999,
        beneficios: { all: true },
        is_admin: true,
        expires_at: null,
        reason: "admin_email_override",
      });
    }

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
        beneficios: { all: true },
        is_admin: true,
        expires_at: null,
        reason: "admin_override",
      });
    }

    /* ============================
       3) ASSINATURA (SEM VIEW)
    ============================ */
    const { data: assinatura, error } = await supabase
      .from("assinaturas")
      .select("plano, nivel, status, expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("❌ ERRO ASSINATURA:", error);
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
       4) BENEFÍCIOS (Z)
    ============================ */
    const nivel = Number(assinatura.nivel || 0);
    const beneficios = getBeneficios(nivel);

    /* ============================
       5) OK FINAL
    ============================ */
    return NextResponse.json({
      ativo: true,
      plano: assinatura.plano,
      nivel,
      beneficios,
      is_admin: false,
      expires_at: assinatura.expires_at ?? null,
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