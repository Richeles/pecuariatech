// app/api/auth/login/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createServerClient,
} from "@supabase/ssr";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function POST(
  req: NextRequest
) {

  try {

    const body =
      await req
        .json()
        .catch(() => null);

    const email =
      String(
        body?.email ?? ""
      ).trim();

    const password =
      String(
        body?.password ?? ""
      );

    if (
      !email
      ||
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

    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl
      ||
      !supabaseAnonKey
    ) {

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

    const response =
      NextResponse.json(

        {
          ok: true,
        },

        {
          status: 200,
        }
      );

    const supabase =
      createServerClient(

        supabaseUrl,

        supabaseAnonKey,

        {

          cookies: {

            getAll() {

              return req.cookies
                .getAll();
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

                    options
                  );
                }
              );
            },
          },
        }
      );

    const {

      data,

      error,

    } =
      await supabase.auth
        .signInWithPassword({

          email,

          password,
        });

    if (
      error
      ||
      !data?.session
    ) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      return NextResponse.json(

        {
          ok: false,

          error:
            error?.message
            ||
            "invalid_login",
        },

        {
          status: 401,
        }
      );
    }

    const {

      data: userData,

      error: userError,

    } =
      await supabase.auth
        .getUser();

    if (
      userError
      ||
      !userData?.user
    ) {

      console.error(
        "USER ERROR:",
        userError
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

    console.log(
      "LOGIN SSR OK:",
      userData.user.email
    );

    return response;

  } catch (err) {

    console.error(
      "LOGIN CRITICAL ERROR:",
      err
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