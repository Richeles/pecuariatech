// CAMINHO: app/lib/supabase-browser.ts
// Browser-only Supabase client
// Next.js App Router safe

"use client";

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
