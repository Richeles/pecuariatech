// app/api/engorda/status/route.ts
// Engorda ULTRA — API read-only (Equação Y)
// Fonte: view public.engorda_base_view (ÂNCORA)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(req: Request) {
  const auth =
    req.headers.get("authorization") ||
    req.headers.get("Authorization") ||
    "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(req: Request) {
  try {
    // 1) Auth Bearer obrigatório
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: missing bearer token" },
        { status: 401 }
      );
    }

    // 2) Supabase Admin (SOMENTE dentro do handler)
    const supabase = supabaseAdmin();

    // 3) Valida token do usuário
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: "Unauthorized: invalid token" },
        { status: 401 }
      );
    }

    // 4) Read-only: consulta view âncora
    const { data: rows, error } = await supabase
      .from("engorda_base_view")
      .select("*")
      .order("data_ref", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Erro ao buscar engorda_base_view" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: "engorda_base_view",
      count: rows?.length ?? 0,
      data: rows ?? [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Erro inesperado" },
      { status: 500 }
    );
  }
}
