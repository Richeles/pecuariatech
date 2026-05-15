// app/api/financeiro/profissional/route.ts
// PecuariaTech — Financeiro Profissional
//
// Runtime estabilizado:
// ✔ Next.js 16
// ✔ Supabase SSR cookie-first
// ✔ Equação Y
// ✔ Regra Z
// ✔ Fail-safe
// ✔ Runtime resiliente
// ✔ Sem cookies legacy
// ✔ Sem get/set/remove
// ✔ Sem getAll manual
//
// Arquitetura oficial:
// createSSRClient centralizado

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

type FinanceiroRow = {

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

  rows:
    FinanceiroRow[];

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
          "financeiro_profissional_view"
        )

        .select("*")

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

      rows:
        (data ??
          []) as FinanceiroRow[],

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