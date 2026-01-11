// app/api/nutricao/custo-dia/route.ts
// NUTRIÇÃO FASE 2 — View read-only (Equação Y)
// Fonte: nutricao_custo_dia_view

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function supabaseFromReq(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const token = getBearerToken(req);

  return createClient(url, anon, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: { persistSession: false },
  });
}

export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized: missing bearer token" }, { status: 401 });

  const supabase = supabaseFromReq(req);
  const { searchParams } = new URL(req.url);

  const animal_id = searchParams.get("animal_id");
  const limit = Number(searchParams.get("limit") || 200);

  let query = supabase
    .from("nutricao_custo_dia_view")
    .select("*")
    .order("custo_nutricao_rs_dia", { ascending: false })
    .limit(Math.min(limit, 1000));

  if (animal_id) query = query.eq("animal_id", animal_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}
