// app/api/lang/route.ts
// PecuariaTech — Runtime Idioma
//
// ✔ Next.js 16
// ✔ Supabase SSR moderno
// ✔ Cookie-first
// ✔ PT-BR + ES-ES
// ✔ Sem locale routing
// ✔ Equação Y
// ✔ Regra Z

import {
  NextRequest,
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

    } =
      await supabase
        .auth
        .getUser();

    /* ==========================================
       DEFAULT
    ========================================== */

    let lang =
      "pt";

    /* ==========================================
       PROFILE LANG
    ========================================== */

    if (user) {

      const {

        data,

      } =
        await supabase

          .from(
            "profiles"
          )

          .select(
            "lang"
          )

          .eq(
            "id",
            user.id
          )

          .maybeSingle();

      if (
        data?.lang === "es"
      ) {

        lang = "es";
      }
    }

    /* ==========================================
       SUCCESS
    ========================================== */

    return NextResponse.json({

      ok: true,

      lang,
    });

  } catch (
    e: any
  ) {

    /* ==========================================
       FAIL SAFE
    ========================================== */

    return NextResponse.json(

      {

        ok: true,

        lang: "pt",

        degraded: true,

        reason:
          "internal_error",
      },

      {
        status: 200,
      }
    );
  }
}

/* =====================================================
   POST
===================================================== */

export async function POST(
  request: NextRequest
) {

  try {

    /* ==========================================
       BODY
    ========================================== */

    const body =
      await request.json();

    const lang =
      body?.lang;

    /* ==========================================
       VALIDATION
    ========================================== */

    if (
      lang !== "pt"
      &&
      lang !== "es"
    ) {

      return NextResponse.json(

        {

          ok: false,

          reason:
            "invalid_lang",
        },

        {
          status: 400,
        }
      );
    }

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
       NO SESSION
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
       UPDATE PROFILE
    ========================================== */

    const {

      error,

    } =
      await supabase

        .from(
          "profiles"
        )

        .update({

          lang,

        })

        .eq(
          "id",
          user.id
        );

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

      lang,
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