// app/lib/supabase/server.ts
// PecuariaTech Runtime
// Next.js 16 + Supabase SSR + Async Cookies

import {
  cookies,
} from "next/headers";

import {
  createServerClient,
} from "@supabase/ssr";

/* =====================================================
   SSR CLIENT
===================================================== */

export async function createSSRClient() {

  const cookieStore =
    await cookies();

  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const anon =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {

    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL missing"
    );
  }

  if (!anon) {

    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY missing"
    );
  }

  return createServerClient(
    url,
    anon,
    {
      cookies: {

        getAll() {

          return cookieStore
            .getAll();
        },

        setAll(cookiesToSet) {

          try {

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {

                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );

          } catch {

            // SSR SAFE
          }
        },
      },
    }
  );
}