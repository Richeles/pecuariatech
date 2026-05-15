// app/api/financeiro/ultra/route.ts
// PecuariaTech — Financeiro Ultra
//
// Arquitetura:
// ✔ Next.js 16
// ✔ Supabase SSR
// ✔ Cookie-first
// ✔ Equação Y
// ✔ Regra Z
// ✔ Runtime resiliente
// ✔ Fail-safe
// ✔ Sem cookies legacy
// ✔ Sem get/set/remove
// ✔ Sem getAll manual

import {
  NextResponse,
} from "next/server";

import {
  createSSRClient,
} from "@/app/lib/supabase/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* =====================================================
   TYPES
===================================================== */

type FinanceiroUltraRow = {

  id?: string;

  user_id?: string;

  data?: string;

  categoria?: string;

  descricao?: string;

  valor?: number;

  tipo?: string;
};

type ResponseOK = {

  ok: true;

  ativo: true;

  rows:
    FinanceiroUltraRow[];

  ts: string;
};

/* =====================================================
   JSON
===================================================== */

function json(
  data: any,
  status = 200
) {

  return NextResponse.json(
    data,
    {
      status,

      headers: {

        "Cache-Control":
          "no-store",
      },
    }
  );
}

/* =====================================================
   GET
===================================================== */

export async function GET() {

  try {

    /* ==========================================
       SSR CLIENT
    ========================================== */

    const supabase =
      await createSSRClient();

    /* ==========================================
       AUTH
    ========================================== */

    const {

      data: {
        user,
      },

      error: authError,

    } =
      await supabase
        .auth
        .getUser();

    /* ==========================================
       REGRA Z
    ========================================== */

    if (
      authError ||
      !user
    ) {

      return json(

        {

          ok: false,

          reason:
            "no_session",
        },

        401
      );
    }

    /* ==========================================
       QUERY
    ========================================== */

    const {

      data,

      error,

    } =
      await supabase

        .from(
          "financeiro_ultra_view"
        )

        .select(`
          id,
          user_id,
          data,
          categoria,
          descricao,
          valor,
          tipo
        `)

        .eq(
          "user_id",
          user.id
        )

        .order(
          "data",
          {
            ascending: false,
          }
        );

    /* ==========================================
       DB ERROR
    ========================================== */

    if (error) {

      return json(

        {

          ok: false,

          reason:
            "db_error",

          message:
            error.message,
        },

        500
      );
    }

    /* ==========================================
       PAYLOAD
    ========================================== */

    const payload:
      ResponseOK = {

      ok: true,

      ativo: true,

      rows:
        (data ??
          []) as FinanceiroUltraRow[],

      ts:
        new Date()
          .toISOString(),
    };

    /* ==========================================
       SUCCESS
    ========================================== */

    return json(
      payload
    );

  } catch (
    e: any
  ) {

    /* ==========================================
       FAIL SAFE
    ========================================== */

    return json(

      {

        ok: false,

        reason:
          "internal_error",

        message:
          e?.message ??
          "unknown",
      },

      500
    );
  }
}