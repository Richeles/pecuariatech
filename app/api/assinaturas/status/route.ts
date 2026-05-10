// app/api/assinaturas/status/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

/* ============================================================================
   MATRIZ DE BENEFÍCIOS (EQUAÇÃO Z)
============================================================================ */

function getBeneficios(nivel: number) {
  /**
   * MASTER / ROOT
   */
  if (nivel >= 999) {
    return {
      all: true,

      /**
       * Premium Governance
       */
      cfo_ultra: true,
      motor_pi: true,

      /**
       * Core
       */
      rebanho: true,
      pastagem: true,
      financeiro: true,

      /**
       * Ultra
       */
      engorda_ultra: true,

      /**
       * Enterprise
       */
      multiusuario: true,
      esg: true,
    };
  }

  return {
    /**
     * Base
     */
    rebanho: true,
    pastagem: true,

    /**
     * Financeiro Progressivo
     */
    financeiro: nivel >= 2,

    /**
     * Premium Governance
     */
    cfo: nivel >= 3,
    cfo_ultra: nivel >= 3,
    motor_pi: nivel >= 3,

    /**
     * Ultra
     */
    engorda_ultra: nivel >= 3,

    /**
     * Enterprise
     */
    multiusuario: nivel >= 4,
    esg: nivel >= 3,
  };
}

/* ============================================================================
   GET
============================================================================ */

export async function GET() {
  console.log("🔥 /api/assinaturas/status EXECUTANDO");

  try {
    const cookieStore = await cookies();

    /* =========================================================================
       SUPABASE SSR COOKIE-FIRST
    ========================================================================= */

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

    /* =========================================================================
       1) SESSION
    ========================================================================= */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        ativo: false,
        reason: "no_session",
      });
    }

    /* =========================================================================
       2) ADMIN MASTER OVERRIDE
    ========================================================================= */

    if (user.email === "pecuariatech2026@gmail.com") {
      return NextResponse.json({
        ativo: true,

        plano: "master",
        nivel: 999,

        beneficios: {
          all: true,
          cfo_ultra: true,
          motor_pi: true,
        },

        /**
         * Premium Governance Layer
         */
        premium: {
          cfo_ultra: {
            locked: false,
            preview: true,
            feature: "cfo_ultra",
            summary: "Governança financeira avançada ativa",
          },
        },

        is_admin: true,
        expires_at: null,
        reason: "admin_email_override",
      });
    }

    /* =========================================================================
       3) ADMIN USERS
    ========================================================================= */

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

        beneficios: {
          all: true,
          cfo_ultra: true,
          motor_pi: true,
        },

        /**
         * Premium Governance Layer
         */
        premium: {
          cfo_ultra: {
            locked: false,
            preview: true,
            feature: "cfo_ultra",
            summary: "Governança financeira avançada ativa",
          },
        },

        is_admin: true,
        expires_at: null,
        reason: "admin_override",
      });
    }

    /* =========================================================================
       4) ASSINATURA
    ========================================================================= */

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

    /* =========================================================================
       5) BENEFÍCIOS
    ========================================================================= */

    const nivel = Number(assinatura.nivel || 0);

    const beneficios = getBeneficios(nivel);

    /**
     * CFO ULTRA
     */
    const cfoUltraEnabled =
      beneficios?.all === true ||
      beneficios?.cfo_ultra === true;

    /* =========================================================================
       6) RESPONSE FINAL
    ========================================================================= */

    return NextResponse.json({
      ativo: true,

      /**
       * Plano
       */
      plano: assinatura.plano,

      nivel,

      /**
       * Benefícios
       */
      beneficios,

      /**
       * Premium Governance Layer
       */
      premium: {
        cfo_ultra: {
          locked: !cfoUltraEnabled,

          preview: true,

          feature: "cfo_ultra",

          summary: cfoUltraEnabled
            ? "Governança financeira avançada ativa"
            : "Estabilidade projetada com oscilação em T+180 dias",
        },
      },

      /**
       * Meta
       */
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