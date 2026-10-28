"use client";

import {
  createBrowserClient as createSupabaseBrowserClient,
} from "@supabase/ssr";

export type Database = any;

const supabase = createSupabaseBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export { supabase };

export const supabaseBrowser = supabase;

export const createClient = () => supabase;

export const createBrowserClient = () => supabase;

export const createClientComponentClient = () => supabase;

export default supabase;