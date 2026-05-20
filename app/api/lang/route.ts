// ======================================================
// PecuariaTech
// Language Runtime API
// Ultra Premium SSR Runtime
// Next.js 16 SAFE
// ======================================================

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  cookies,
} from "next/headers";

import {
  createSSRClient,
} from "@/app/lib/supabase/server";

// ======================================================

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

// ======================================================
// VALID LANGS
// ======================================================

const VALID_LANGS = [

  "pt",

  "es",

  "en",
];

// ======================================================
// GET
// ======================================================

export async function GET() {

  try {

    // ==================================================
    // COOKIE STORE
    // ==================================================

    const cookieStore =
      await cookies();

    // ==================================================
    // COOKIE FIRST
    // ==================================================

    const cookieLang =
      cookieStore.get(
        "PT_LOCALE"
      )?.value;

    // ==================================================
    // VALID COOKIE
    // ==================================================

    if (
      cookieLang &&
      VALID_LANGS.includes(
        cookieLang
      )
    ) {

      return NextResponse.json({

        ok: true,

        lang:
          cookieLang,

        source:
          "cookie",
      });
    }

    // ==================================================
    // SSR CLIENT
    // ==================================================

    const supabase =
      await createSSRClient();

    // ==================================================
    // AUTH
    // ==================================================

    const {

      data: {
        user,
      },

    } =
      await supabase
        .auth
        .getUser();

    // ==================================================
    // DEFAULT
    // ==================================================

    let lang =
      "pt";

    // ==================================================
    // PROFILE
    // ==================================================

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

      // ================================================
      // VALID DB LANG
      // ================================================

      if (

        data?.lang &&

        VALID_LANGS.includes(
          data.lang
        )
      ) {

        lang =
          data.lang;
      }
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json({

      ok: true,

      lang,

      source:
        "database",
    });

  } catch (
    error: any
  ) {

    console.error(

      "LANG GET ERROR",

      error
    );

    // ==================================================
    // FAIL SAFE
    // ==================================================

    return NextResponse.json({

      ok: true,

      lang: "pt",

      degraded: true,

      reason:
        "internal_error",
    });
  }
}

// ======================================================
// POST
// ======================================================

export async function POST(
  request: NextRequest
) {

  try {

    // ==================================================
    // BODY
    // ==================================================

    const body =
      await request.json();

    const lang =
      body?.lang;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !VALID_LANGS.includes(
        lang
      )
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

    // ==================================================
    // COOKIE STORE
    // ==================================================

    const cookieStore =
      await cookies();

    // ==================================================
    // SET COOKIE
    // ==================================================

    cookieStore.set(

      "PT_LOCALE",

      lang,

      {

        path: "/",

        httpOnly: false,

        sameSite: "lax",

        secure: false,

        maxAge:
          60 *
          60 *
          24 *
          365,
      }
    );

    // ==================================================
    // SSR CLIENT
    // ==================================================

    const supabase =
      await createSSRClient();

    // ==================================================
    // AUTH
    // ==================================================

    const {

      data: {
        user,
      },

    } =
      await supabase
        .auth
        .getUser();

    // ==================================================
    // OPTIONAL PROFILE UPDATE
    // ==================================================

    if (user) {

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
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json({

      ok: true,

      lang,

      runtime:
        "LANG_RUNTIME_OK",
    });

  } catch (
    error: any
  ) {

    console.error(

      "LANG POST ERROR",

      error
    );

    // ==================================================
    // FAIL SAFE
    // ==================================================

    return NextResponse.json(

      {

        ok: false,

        reason:
          "internal_error",

        message:
          error?.message ??
          "unknown_error",
      },

      {

        status: 500,
      }
    );
  }
}