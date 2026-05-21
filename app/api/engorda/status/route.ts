import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";

import { createServerClient }
from "@supabase/ssr";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

/* =========================================================
   LIMIT
========================================================= */

function parseLimit(v: string | null) {

  const n =
    Number(v ?? "60");

  if (!Number.isFinite(n)) {
    return 60;
  }

  return Math.min(
    Math.max(n, 1),
    200
  );
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  req: NextRequest
) {

  try {

    /* =====================================================
       ENV
    ===================================================== */

    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {

      return NextResponse.json(
        {
          ativo: false,
          reason: "missing_env",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       COOKIE SSR FIRST
    ===================================================== */

    const cookieStore =
      await cookies();

    const supabase =
      createServerClient(

        supabaseUrl,
        supabaseAnonKey,

        {
          cookies: {

            get(name: string) {

              return cookieStore
                .get(name)?.value;
            },

            set() {},

            remove() {},
          },
        }
      );

    /* =====================================================
       USER
    ===================================================== */

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {

      return NextResponse.json(
        {
          ativo: false,
          reason: "no_session",
        },
        { status: 401 }
      );
    }

    /* =====================================================
       QUERY PARAMS
    ===================================================== */

    const { searchParams } =
      new URL(req.url);

    const limit =
      parseLimit(
        searchParams.get("limit")
      );

    /* =====================================================
       SELECT PREMIUM
    ===================================================== */

    const preferredFields = [

      "animal_id",

      "brinco",

      "raca",

      "sexo",

      "sistema_engorda",

      "peso_kg_atual",

      "peso_alvo_kg",

      "gmd_kg_dia",

      "custo_rs_dia",

      "risco_operacional",

      "dias_ate_alvo",

      "alerta_status",

      "movimentacao_local",

      "piquete_nome",

      "tipo_pasto",

      "capacidade_ua",
    ];

    const minimalFields = [

      "animal_id",

      "brinco",

      "raca",

      "sexo",
    ];

    /* =====================================================
       QUERY 1
    ===================================================== */

    const q1 =
      await supabase
        .from(
          "engorda_base_view"
        )
        .select(
          preferredFields.join(",")
        )
        .order(
          "animal_id",
          {
            ascending: true,
          }
        )
        .limit(limit);

    if (!q1.error) {

      return NextResponse.json({

        ok: true,

        ativo: true,

        source:
          "engorda_base_view",

        user: {

          id: user.id,

          email: user.email,
        },

        filters: {
          limit,
        },

        data:
          q1.data ?? [],
      });
    }

    /* =====================================================
       FALLBACK
    ===================================================== */

    const q2 =
      await supabase
        .from(
          "engorda_base_view"
        )
        .select(
          minimalFields.join(",")
        )
        .order(
          "animal_id",
          {
            ascending: true,
          }
        )
        .limit(limit);

    if (q2.error) {

      return NextResponse.json(
        {

          ativo: false,

          reason:
            "schema_mismatch",

          details:
            q2.error.message,

          hint:
            "Validar schema da engorda_base_view",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       FALLBACK SUCCESS
    ===================================================== */

    return NextResponse.json({

      ok: true,

      ativo: true,

      warning:
        "Fallback aplicado por mismatch de schema.",

      source:
        "engorda_base_view",

      user: {

        id: user.id,

        email: user.email,
      },

      filters: {
        limit,
      },

      data:
        q2.data ?? [],
    });

  } catch (e: any) {

    console.error(
      "ERRO API ENGORDA:",
      e
    );

    return NextResponse.json(
      {

        ativo: false,

        reason:
          "internal_error",

        details:
          e?.message ??
          String(e),
      },
      { status: 500 }
    );
  }
}