// app/api/engorda/status/route.ts
// Engorda ULTRA — API read-only (Equação Y)
// Regras:
// - 401 sem Bearer JWT
// - 200 com Bearer JWT válido
// - NUNCA 500 por mismatch de coluna (fallback mínimo)
// - client Supabase criado dentro do handler
// - validação token canônica: auth.getUser() usando header Authorization

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
  const n = Number(v ?? "60");
  if (!Number.isFinite(n)) return 60;
  return Math.min(Math.max(n, 1), 200);
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

    // 4) validação canônica do token
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized: invalid token",
          details: userErr?.message ?? null,
          debug: {
            tokenLength: token.length,
            tokenPrefix: token.slice(0, 18),
            anonLength: anon.length,
            anonPrefix: anon.slice(0, 12),
            supabaseUrlPrefix: url.slice(0, 35),
          },
        },
        { status: 401 }
      );
    }

    // 5) query params
    const { searchParams } = new URL(req.url);
    const limit = parseLimit(searchParams.get("limit"));

    // 6) SELECT resiliente (Equação Y)
    // A view é âncora. API se adapta.
    // ✅ NÃO usar: data_ref, status_engorda (já provado que não existe)
    const preferredFields = [
      "animal_id",
      "brinco",
      "raca",
      "sexo",
      "sistema_engorda",
      "peso_kg_atual",
      "peso_alvo_kg",
      "gmd_kg_dia",
      "custo_rs_dia",
      "risco_operacional",
      "dias_ate_alvo",
      "alerta_status",
      "movimentacao_local",
      "piquete_nome",
      "tipo_pasto",
      "capacidade_ua",
    ];

    const minimalFields = ["animal_id", "brinco", "raca", "sexo"];

    // tentativa 1: preferido
    const q1 = await supabase
      .from("engorda_base_view")
      .select(preferredFields.join(","))
      .order("animal_id", { ascending: true })
      .limit(limit);

    if (!q1.error) {
      return NextResponse.json({
        ok: true,
        source: "engorda_base_view",
        user: { id: userData.user.id, email: userData.user.email },
        filters: { limit },
        data: q1.data ?? [],
      });
    }

    // fallback final: mínimo (API nunca quebra por mismatch)
    const q2 = await supabase
      .from("engorda_base_view")
      .select(minimalFields.join(","))
      .order("animal_id", { ascending: true })
      .limit(limit);

    if (q2.error) {
      return NextResponse.json(
        {
          error: "Supabase query error",
          details: q2.error.message,
          hint:
            "Mesmo select mínimo falhou. Validar schema real da engorda_base_view no Supabase.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: "engorda_base_view",
      user: { id: userData.user.id, email: userData.user.email },
      filters: { limit },
      warning: "Fallback aplicado por mismatch de schema na view.",
      data: q2.data ?? [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
