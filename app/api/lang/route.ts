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
       LANG
    ========================================== */

    let lang =
      "pt";

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

    return NextResponse.json(

      {

        ok: true,

        lang,
      }
    );

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