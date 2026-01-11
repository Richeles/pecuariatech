// app/api/engorda/projecao/route.ts
// Engorda ULTRA — API read-only (Equação Y)
// Fonte: view public.engorda_projecao_view
// Filtros: cenario, alerta, limit

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function parseLimit(v: string | null) {
  const n = Number(v ?? "60");
  if (!Number.isFinite(n)) return 60;
  return Math.min(Math.max(n, 1), 200);
}

export async function GET(req: Request) {
  try {
    // 1) Bearer obrigatório
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: missing bearer token" },
        { status: 401 }
      );
    }

    // 2) Supabase dentro do handler
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return NextResponse.json(
        { error: "Server misconfigured: Supabase env missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(url, anon, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: { persistSession: false },
    });

    // 3) Validar token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: "Unauthorized: invalid token" },
        { status: 401 }
      );
    }

    // 4) Query params
    const { searchParams } = new URL(req.url);
    const cenario = searchParams.get("cenario")?.toUpperCase() ?? "RAPIDO";
    const alerta = searchParams.get("alerta")?.trim() ?? "";
    const limit = parseLimit(searchParams.get("limit"));

    // 5) Query base (read-only)
    let query = supabase
      .from("engorda_projecao_view")
      .select(
        [
          "animal_id",
          "brinco",
          "raca",
          "sexo",
          "sistema_engorda",
          "cenario",
          "peso_kg_atual",
          "peso_alvo_kg",
          "gmd_kg_dia",
          "custo_rs_dia",
          "risco_operacional",
          "dias_ate_alvo",
          "margem_proj_rs",
          "pi_score",
          "alerta_status",
          "movimentacao_local",
          "piquete_nome",
          "tipo_pasto",
          "capacidade_ua",
        ].join(",")
      )
      .eq("cenario", cenario)
      .order("pi_score", { ascending: false })
      .limit(limit);

    if (alerta) {
      query = query.eq("alerta_status", alerta);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Erro ao consultar engorda_projecao_view" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: "engorda_projecao_view",
      filters: { cenario, alerta, limit },
      data: data ?? [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Erro inesperado" },
      { status: 500 }
    );
  }
}
