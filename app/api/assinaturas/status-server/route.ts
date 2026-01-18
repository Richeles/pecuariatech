// app/api/assinaturas/status-server/route.ts
// SaaS por Plano — ÂNCORA DE PERMISSÃO (Equação Y)
// Server-friendly: usa cookie do Supabase (SSR)
// Fonte: public.assinaturas (gravada pelo webhook Mercado Pago)
//
// Regras:
// - read-only
// - anti-quebra (não depende de colunas inexistentes)
// - compatível com middleware
// - shape de resposta estável

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { permissoesDoPlano, PlanoInterno } from "@/app/lib/planos/permissoes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// -------------------------
// Utils
// -------------------------

function isAtiva(status: any): boolean {
  const v = String(status ?? "").toLowerCase().trim();
  return v === "ativa" || v === "active" || v.includes("ativa");
}

// ⚠️ Fallback seguro
// Enquanto não houver mapa plano_id → plano_slug
function planoFromPlanoId(_planoId: any): PlanoInterno {
  // 🔒 SAFE DEFAULT
  return "basico";
}

function planoToNivel(plano: PlanoInterno): number {
  if (plano === "premium") return 3;
  if (plano === "pro") return 2;
  return 1;
}

// -------------------------
// Handler
// -------------------------

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json(
        { error: "Server misconfigured: missing Supabase env" },
        { status: 500 }
      );
    }

    // ✅ Cookie SSR (middleware → API)
    const cookie = req.headers.get("cookie") ?? "";

    const supabase = createClient(url, anon, {
      global: { headers: { cookie } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Validar sessão
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return NextResponse.json(
        {
          ativo: false,
          plano: "basico",
          nivel: 1,
          expires_at: null,
          beneficios: permissoesDoPlano("basico"),
        },
        { status: 200 }
      );
    }

    const userId = userData.user.id;

    // 2) Buscar última assinatura
    const { data: rows, error } = await supabase
      .from("assinaturas")
      .select("id, user_id, plano_id, status, renovacao_em, fim_trial, criado_em")
      .eq("user_id", userId)
      .order("criado_em", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: "Supabase query error", details: error.message },
        { status: 500 }
      );
    }

    const list = Array.isArray(rows) ? rows : [];
    const active = list.find((r) => isAtiva(r?.status));

    // 3) Sem assinatura ativa
    if (!active) {
      return NextResponse.json(
        {
          ativo: false,
          plano: "basico",
          nivel: 1,
          expires_at: null,
          beneficios: permissoesDoPlano("basico"),
        },
        { status: 200 }
      );
    }

    // 4) Derivação canônica (Equação Y)
    const plano = planoFromPlanoId(active.plano_id);
    const nivel = planoToNivel(plano);
    const expires_at = active.renovacao_em ?? active.fim_trial ?? null;

    return NextResponse.json(
      {
        ativo: true,
        plano,
        nivel,
        expires_at,
        plano_id: active.plano_id ?? null,
        beneficios: permissoesDoPlano(plano),
        assinatura: {
          id: active.id ?? null,
          status: active.status ?? null,
          criado_em: active.criado_em ?? null,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
