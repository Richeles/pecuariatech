// app/api/engorda/projecao/route.ts
// Engorda ULTRA — API read-only (Equação Y)
// Fonte: view public.engorda_projecao_view (DERIVADA)

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

    // 2) Supabase client (SOMENTE dentro do handler)
    const supabase = supabaseAdmin();

    // 3) Valida token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: "Unauthorized: invalid token" },
        { status: 401 }
      );
    }

    // 4) Buscar dados da view (read-only)
    const { data: rows, error } = await supabase
      .from("engorda_projecao_view")
      .select("cenario,pi_score,risco_operacional,margem_proj_rs")
      .limit(1000);

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Erro ao buscar engorda_projecao_view" },
        { status: 500 }
      );
    }

    const total = rows?.length ?? 0;

    // KPIs
    const valid = (rows ?? []).filter((r: any) => (r.pi_score ?? 0) > 0);
    const top = valid
      .sort((a: any, b: any) => (b.pi_score ?? 0) - (a.pi_score ?? 0))
      .slice(0, 30);

    const margemMedia = top.length
      ? top.reduce((acc: number, r: any) => acc + (r.margem_proj_rs ?? 0), 0) /
        top.length
      : 0;

    const riscoMedio = top.length
      ? top.reduce((acc: number, r: any) => acc + (r.risco_operacional ?? 0), 0) /
        top.length
      : 0;

    // Contagem por cenário
    const porCenario = (rows ?? []).reduce(
      (acc: Record<string, number>, r: any) => {
        const c = String(r.cenario ?? "INDEFINIDO");
        acc[c] = (acc[c] ?? 0) + 1;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      ok: true,
      source: "engorda_projecao_view",
      total,
      top_count: top.length,
      margem_media_top: margemMedia,
      risco_medio_top: riscoMedio,
      por_cenario: porCenario,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Erro inesperado" },
      { status: 500 }
    );
  }
}
