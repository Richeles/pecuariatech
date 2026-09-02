// =========================================================
// PecuariaTech
// Supabase Browser Runtime
// Next.js 16 + App Router
// Runtime Premium Canônico
// Equação Y + Regra Z + Triângulo 360
// =========================================================

"use client";

/* =========================================================
   SUPABASE
========================================================= */

import {
  createClient as createSupabaseClient,
  SupabaseClient,
} from "@supabase/supabase-js";

/* =========================================================
   ENV
========================================================= */

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY;

/* =========================================================
   VALIDATION
========================================================= */

if (!supabaseUrl) {

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL não configurada."
  );
}

if (!supabaseAnonKey) {

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada."
  );
}

/* =========================================================
   TYPES
========================================================= */

export type Database = any;

/* =========================================================
   GLOBAL SINGLETON
========================================================= */

declare global {

  // eslint-disable-next-line no-var
  var __pecuariatech_supabase__:
    SupabaseClient<Database>
    | undefined;
}

/* =========================================================
   BUILD CLIENT
========================================================= */

function buildClient() {

  return createSupabaseClient<Database>(

    supabaseUrl,
    supabaseAnonKey,

    {

      auth: {

        persistSession: true,

        autoRefreshToken: true,

        detectSessionInUrl: true,
      },

      global: {

        headers: {

          "x-pecuariatech-runtime":
            "browser-premium",
        },
      },
    }
  );
}

/* =========================================================
   CREATE BROWSER CLIENT
========================================================= */

export function createBrowserClient() {

  if (
    !globalThis
      .__pecuariatech_supabase__
  ) {

    globalThis
      .__pecuariatech_supabase__ =
        buildClient();
  }

  return globalThis
    .__pecuariatech_supabase__;
}

/* =========================================================
   LEGACY COMPATIBILITY
========================================================= */

export const createClient =
  createBrowserClient;

export const createClientComponentClient =
  createBrowserClient;

/* =========================================================
   IMPORTANT
========================================================= */

/*
  NÃO exportar:

  export const supabase = ...

  Isso causa:
  - hydration issues
  - React child crash
  - object rendering
*/

/* =========================================================
   DEFAULT
========================================================= */

export default createBrowserClient;