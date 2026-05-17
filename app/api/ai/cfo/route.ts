// =========================================================
// PecuariaTech
// CFO Runtime AI
// Equação Y + Runtime Python
// SSR Cookie First
// =========================================================

import { NextResponse } from "next/server";

import { cookies }
  from "next/headers";

import {
  createServerClient,
} from "@supabase/ssr";

/* =========================================================
   GET
========================================================= */

export async function GET() {

  try {

    /* =====================================================
       COOKIES
    ===================================================== */

    const cookieStore =
      await cookies();

    /* =====================================================
       SUPABASE SSR
    ===================================================== */

    const supabase =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,

        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,

        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },

            setAll() {},
          },
        }
      );

    /* =====================================================
       USER
    ===================================================== */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {

      return NextResponse.json(
        {
          ok: false,
          reason: "no_session",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       RESUMO
    ===================================================== */

    const {
      data: resumo,
      error: resumoError,
    } = await supabase
      .from("financeiro_resumo_view")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (resumoError) {

      return NextResponse.json(
        {
          ok: false,
          error:
            resumoError.message,
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       MENSAL
    ===================================================== */

    const {
      data: mensal,
      error: mensalError,
    } = await supabase
      .from("financeiro_mensal_view")
      .select("*")
      .eq("user_id", user.id)
      .limit(12);

    if (mensalError) {

      return NextResponse.json(
        {
          ok: false,
          error:
            mensalError.message,
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       PYTHON AI
    ===================================================== */

    const pythonResponse =
      await fetch(
        `${process.env.PYTHON_API_URL}/cfo/analisar`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            user_id: user.id,
            resumo,
            mensal,
          }),
        }
      );

    const ai =
      await pythonResponse.json();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({

      ok: true,

      runtime:
        "CFO_RUNTIME_AI",

      source:
        "equacao_y",

      resumo,

      mensal,

      ai,

    });

  } catch (error: any) {

    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "internal_error",
      },
      {
        status: 500,
      }
    );
  }
}