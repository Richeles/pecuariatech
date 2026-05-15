// =========================================================
// PecuariaTech
// API — Assinatura Status
// Next.js 16
// Equação Y + Regra Z + Triângulo 360
// =========================================================

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createServerClient,
} from "@supabase/ssr";

export const dynamic =
  "force-dynamic";

/* =========================================================
   BENEFÍCIOS
========================================================= */

function getBeneficios(
  nivel: number
) {

  // =====================================================
  // MASTER
  // =====================================================

  if (nivel >= 999) {

    return {

      all: true,

      // CORE
      rebanho: true,
      pastagem: true,
      financeiro: true,

      // PREMIUM
      cfo: true,
      cfo_ultra: true,

      // IA
      motor_pi: true,

      // ULTRA
      engorda_ultra: true,

      // ENTERPRISE
      multiusuario: true,
      esg: true,
    };
  }

  // =====================================================
  // PLANOS NORMAIS
  // =====================================================

  return {

    // CORE
    rebanho: true,
    pastagem: true,

    // FINANCEIRO
    financeiro:
      nivel >= 2,

    // PREMIUM
    cfo:
      nivel >= 3,

    cfo_ultra:
      nivel >= 3,

    motor_pi:
      nivel >= 3,

    // ULTRA
    engorda_ultra:
      nivel >= 3,

    // ENTERPRISE
    multiusuario:
      nivel >= 4,

    esg:
      nivel >= 3,
  };
}

/* =========================================================
   GET
========================================================= */

export async function GET() {

  try {

    console.log(
      "🔥 /api/assinaturas/status"
    );

    // =====================================================
    // COOKIES SSR
    // =====================================================

    const cookieStore =
      await cookies();

    // =====================================================
    // SUPABASE SSR
    // =====================================================

    const supabase =
      createServerClient(

        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,

        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,

        {
          cookies: {

            getAll() {

              return cookieStore
                .getAll()
                .map((cookie) => ({

                  name:
                    cookie.name,

                  value:
                    cookie.value,
                }));
            },

            setAll(
              cookiesToSet
            ) {

              cookiesToSet.forEach(

                ({
                  name,
                  value,
                  options,
                }) => {

                  try {

                    cookieStore.set(
                      name,
                      value,
                      options
                    );

                  } catch {}
                }
              );
            },
          },
        }
      );

    // =====================================================
    // USER
    // =====================================================

    const {

      data: { user },

      error: userError,

    } =
      await supabase.auth
        .getUser();

    console.log(
      "👤 USER:",
      user?.email
    );

    // =====================================================
    // USER ERROR
    // =====================================================

    if (userError) {

      console.error(
        "❌ USER ERROR:",
        userError
      );

      return NextResponse.json({

        ativo: false,

        reason:
          "user_error",
      });
    }

    // =====================================================
    // SEM SESSÃO
    // =====================================================

    if (!user) {

      return NextResponse.json({

        ativo: false,

        reason:
          "no_session",
      });
    }

    // =====================================================
    // MASTER EMAIL
    // =====================================================

    if (
      user.email ===
      "pecuariatech2026@gmail.com"
    ) {

      console.log(
        "🟢 MASTER EMAIL"
      );

      return NextResponse.json({

        ativo: true,

        plano: "master",

        nivel: 999,

        beneficios:
          getBeneficios(999),

        is_admin: true,

        expires_at: null,

        reason:
          "admin_email_override",
      });
    }

    // =====================================================
    // ADMIN USERS
    // =====================================================

    const {

      data: admin,

      error: adminError,

    } =
      await supabase
        .from("admin_users")
        .select(`
          user_id,
          role,
          ativo,
          is_active
        `)
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "role",
          "master"
        )
        .or(
          "ativo.eq.true,is_active.eq.true"
        )
        .maybeSingle();

    if (adminError) {

      console.error(
        "❌ ADMIN ERROR:",
        adminError
      );
    }

    // =====================================================
    // MASTER OVERRIDE
    // =====================================================

    if (admin) {

      console.log(
        "🟢 ADMIN OVERRIDE"
      );

      return NextResponse.json({

        ativo: true,

        plano: "master",

        nivel: 999,

        beneficios:
          getBeneficios(999),

        is_admin: true,

        expires_at: null,

        reason:
          "admin_override",
      });
    }

    // =====================================================
    // ASSINATURA
    // =====================================================

    const {

      data: assinatura,

      error,

    } =
      await supabase
        .from("assinaturas")
        .select(`
          plano,
          nivel,
          status,
          expires_at,
          atualizado_em
        `)
        .eq(
          "user_id",
          user.id
        )
        .order(
          "atualizado_em",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

    console.log(
      "📦 ASSINATURA:",
      assinatura
    );

    // =====================================================
    // ERRO
    // =====================================================

    if (error) {

      console.error(
        "❌ ASSINATURA ERROR:",
        error
      );

      return NextResponse.json({

        ativo: false,

        reason:
          "internal_error",
      });
    }

    // =====================================================
    // SEM ASSINATURA
    // =====================================================

    const isAtiva =

      assinatura?.status ===
        "ativa"

      ||

      assinatura?.status ===
        "ativo";

    if (
      !assinatura
      ||
      !isAtiva
    ) {

      return NextResponse.json({

        ativo: false,

        reason:
          "no_subscription",
      });
    }

    // =====================================================
    // NÍVEL CANÔNICO
    // =====================================================

    let nivel = 1;

    const plano =
      String(
        assinatura.plano || ""
      ).toLowerCase();

    switch (plano) {

      case "basico":

        nivel = 1;
        break;

      case "pro":

      case "profissional":

        nivel = 2;
        break;

      case "ultra":

        nivel = 3;
        break;

      case "enterprise":

      case "empresarial":

      case "premium_dominus":

        nivel = 4;
        break;

      case "master":

        nivel = 999;
        break;

      default:

        nivel = 1;
    }

    // =====================================================
    // BENEFÍCIOS
    // =====================================================

    const beneficios =
      getBeneficios(
        nivel
      );

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({

      ativo: true,

      plano:
        assinatura.plano,

      nivel,

      beneficios,

      is_admin: false,

      expires_at:
        assinatura.expires_at
        ?? null,

      reason: "ok",
    });

  } catch (err) {

    console.error(
      "💥 ERRO CRÍTICO:",
      err
    );

    return NextResponse.json({

      ativo: false,

      reason:
        "internal_error",
    });
  }
}