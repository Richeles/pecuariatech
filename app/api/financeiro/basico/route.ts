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
      await supabase.auth.getUser();

    /* ==========================================
       REGRA Z
    ========================================== */

    if (
      authError ||
      !user
    ) {

      return NextResponse.json(

        {

          ok: false,

          reason:
            "no_session",
        },

        {
          status: 401,
        }
      );
    }

    /* ==========================================
       VIEW
    ========================================== */

    const {

      data,

      error,

    } =
      await supabase

        .from(
          "financeiro_basico_view"
        )

        .select("*")

        .eq(
          "user_id",
          user.id
        )

        .maybeSingle();

    /* ==========================================
       DB ERROR
    ========================================== */

    if (error) {

      return NextResponse.json(

        {

          ok: false,

          reason:
            "db_error",

          error:
            error.message,
        },

        {
          status: 500,
        }
      );
    }

    /* ==========================================
       SUCCESS
    ========================================== */

    return NextResponse.json({

      ok: true,

      row:
        data ?? {},
    });

  } catch (
    e: any
  ) {

    /* ==========================================
       FAIL SAFE
    ========================================== */

    return NextResponse.json(

      {

        ok: false,

        reason:
          "internal_error",

        message:
          e?.message ??
          "unknown",
      },

      {
        status: 500,
      }
    );
  }
}