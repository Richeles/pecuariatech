// =========================================================
// PecuariaTech Ultra
// Login SSR CANÔNICO
// Equação Y + Regra Z + Triângulo 360
// =========================================================

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createServerClient,
} from "@supabase/ssr";

import * as Sentry
from "@sentry/nextjs";

// =========================================================
// NEXT RUNTIME
// =========================================================

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

// =========================================================
// LOGIN SSR
// =========================================================

export async function POST(
  req: NextRequest
) {

  try {

    // =====================================================
    // BODY
    // =====================================================

    const body =
      await req
        .json()
        .catch(() => null);

    const email =
      String(
        body?.email ?? ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        body?.password ?? ""
      );

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !email ||
      !password
    ) {

      return NextResponse.json(
        {
          ok: false,
          error:
            "missing_credentials",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // ENV
    // =====================================================

    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnon =
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnon
    ) {

      console.error(
        "🚨 LOGIN SSR: missing env"
      );

      Sentry.captureMessage(
        "LOGIN SSR missing env",
        "error"
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "missing_env",
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // RESPONSE SSR
    // =====================================================

    const response =
      NextResponse.json(
        {
          ok: true,
        },
        {
          status: 200,
        }
      );

    // =====================================================
    // SUPABASE SSR
    // =====================================================

    const supabase =
      createServerClient(
        supabaseUrl,
        supabaseAnon,
        {

          cookies: {

            getAll() {

              return req.cookies.getAll();
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

                  response.cookies.set(
                    name,
                    value,
                    {

                      ...options,

                      httpOnly: true,

                      sameSite:
                        "lax",

                      secure:
                        process.env
                          .NODE_ENV ===
                        "production",

                      path: "/",
                    }
                  );
                }
              );
            },
          },
        }
      );

    // =====================================================
    // SENTRY BREADCRUMB
    // =====================================================

    Sentry.addBreadcrumb({

      category: "auth",

      message:
        "Tentativa login SSR",

      level: "info",

      data: {

        email,

        route:
          "/api/auth/login",

        runtime:
          "SSR",
      },
    });

    // =====================================================
    // LOGIN
    // =====================================================

    const {
      data,
      error,
    } =
      await supabase.auth
        .signInWithPassword({

          email,
          password,
        });

    console.log(
      "🔥 PASSOU SIGNIN"
    );

    // =====================================================
    // LOGIN ERROR
    // =====================================================

    if (
      error ||
      !data?.session
    ) {

      console.error(
        "❌ LOGIN SSR ERROR:",
        error
      );

      // ===============================================
      // SENTRY
      // ===============================================

      Sentry.captureException(
        error,
        {

          tags: {

            layer:
              "SUPABASE_AUTH",

            runtime:
              "SSR",

            route:
              "/api/auth/login",
          },

          extra: {

            email,

            error_code:
              error?.code,

            error_status:
              error?.status,

            auth_layer:
              "signInWithPassword",
          },
        }
      );

      return NextResponse.json(
        {
          ok: false,

          error:
            error?.message ??
            "invalid_login",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // VALIDAR USER SSR
    // =====================================================

    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth
        .getUser();

    console.log(
      "🔥 PASSOU GETUSER"
    );

    if (
      userError ||
      !userData?.user
    ) {

      console.error(
        "🚨 USER SSR ERROR:",
        userError
      );

      Sentry.captureException(
        userError,
        {

          tags: {

            layer:
              "SUPABASE_GET_USER",

            runtime:
              "SSR",
          },

          extra: {

            email,
          },
        }
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "session_not_persisted",
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // SUCCESS LOGS
    // =====================================================

    console.log(
      "🟢 LOGIN SSR OK:",
      userData.user.email
    );

    console.log(
      "🍪 SSR COOKIE:",
      response.cookies
        .getAll()
        .length > 0
    );

    console.log(
      "🔥 RETORNANDO RESPONSE"
    );

    // =====================================================
    // SENTRY SUCCESS
    // =====================================================

    Sentry.captureMessage(
      "LOGIN SSR SUCCESS",
      {

        level: "info",

        tags: {

          layer:
            "AUTH_SUCCESS",

          runtime:
            "SSR",
        },

        extra: {

          email,
        },
      }
    );

    // =====================================================
    // RESPONSE FINAL
    // =====================================================

    return response;

  } catch (e: any) {

    console.error(
      "💥 LOGIN SSR EXCEPTION:",
      e
    );

    Sentry.captureException(
      e,
      {

        tags: {

          layer:
            "LOGIN_EXCEPTION",

          runtime:
            "SSR",
        },
      }
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "login_exception",
      },
      {
        status: 500,
      }
    );
  }
}