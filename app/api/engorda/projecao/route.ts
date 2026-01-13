// app/api/engorda/projecao/route.ts
// Engorda ULTRA — API read-only (Equação Y)
// Fonte: view public.engorda_projecao_view (DERIVADA)
//
// Regras:
// - 401 sem Bearer JWT
// - 200 com Bearer JWT válido
// - NUNCA 500 por mismatch (sem order em colunas incertas)
// - client Supabase criado dentro do handler
// - validação token canônica: auth.getUser() com header Authorization

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

function parseLimit(v: string | null) {
  const n = Number(v ?? "120");
  if (!Number.isFinite(n)) return 120;
  return Math.min(Math.max(n, 1), 400);
}

export async function GET(req: Request) {
  try {
    // 1) token obrigatório
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: missing bearer token" },
        { status: 401 }
      );
    }

    // 2) env obrigatório
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json(
        { error: "Server misconfigured: missing Supabase env (URL/ANON)" },
        { status: 500 }
      );
    }

    // 3) client canônico com Authorization header
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 4) validação canônica do token (SEM passar token como argumento)
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized: invalid token",
          details: userErr?.message ?? null,
          debug: {
            tokenLength: token.length,
            tokenPrefix: token.slice(0, 18),
            supabaseUrlPrefix: url.slice(0, 35),
          },
        },
        { status: 401 }
      );
    }

    // 5) query params
    const { searchParams } = new URL(req.url);
    const limit = parseLimit(searchParams.get("limit"));

    // 6) Query read-only na view derivada
    // Anti-500: select("*") para não depender de colunas instáveis agora.
    // (mais tarde refinamos os campos quando o schema estiver fechado)
    const { data, error } = await supabase
      .from("engorda_projecao_view")
      .select("*")
      .limit(limit);

    if (error) {
      return NextResponse.json(
        {
          error: "Supabase query error",
          details: error.message,
          hint:
            "Mismatch API vs schema. Confira colunas da view engorda_projecao_view no Supabase.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: "engorda_projecao_view",
      user: { id: userData.user.id, email: userData.user.email },
      filters: { limit },
      total: Array.isArray(data) ? data.length : 0,
      data: data ?? [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
