// =========================================================
// PecuariaTech
// Supabase Browser Runtime
// Equação Y + Compatibilidade Global
// =========================================================

"use client";

/* =========================================================
   SUPABASE
========================================================= */

import {
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";

/* =========================================================
   DATABASE TYPE
========================================================= */

export type Database = any;

/* =========================================================
   SINGLETON
========================================================= */

let browserClient:
  ReturnType<
    typeof createClientComponentClient<Database>
  > | null = null;

/* =========================================================
   CREATE BROWSER CLIENT
========================================================= */

export function createBrowserClient() {

  if (!browserClient) {

    browserClient =
      createClientComponentClient<Database>();
  }

  return browserClient;
}

/* =========================================================
   LEGACY SUPPORT
   NÃO REMOVER
========================================================= */

export const createClient =
  createBrowserClient;

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default createBrowserClient;