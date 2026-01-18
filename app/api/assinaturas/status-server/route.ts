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
import { permissoesDoPlano } from "@/app/lib/planos/permissoes"; // ✅ DERIVADO canônico

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// -------------------------
// Utils
// -------------------------

function isAtiva(status: any): boolean {
  const v = String(status ?? "").toLowerCase().trim();
  return v === "ativa" || v === "active" || v.includes("ativa");
}

// ⚠️ Fallback SEGURO
// Enquanto não houver mapa plano_id → plano_slug
export type PlanoInterno = "basico" | "pro" | "premium";

function planoFromPlanoId(_planoId: any): PlanoInterno {
  // 🔒 fallback seguro (não quebra middleware nem UI)
  // (quando mapear UUIDs reais, aqui vira lookup real)
  return "basico";
}

function planoToNivel(plano: PlanoInterno): number {
  if (plano === "premium") return 3;
  if (plano === "pro") return 2;
  return 1;
}

// -------------------------
// Benefícios LEGADOS (fallback)
// -------------------------
// Mantidos APENAS para compatibilidade retroativa.
// A fonte oficial é permissoesDoPlano(plano)
function buildBeneficiosLegacy(plano: PlanoInterno) {
  const base = {
    rebanho: true,
    pastagem: true,

    engorda_base: false,
    engorda_ultra: false,

    financeiro: false,
    cfo: false,

    esg: false,
    multiusuario: false,
  };

  if (plano === "pro") {
    return {
      ...base,
      engorda_base: true,
      financeiro: true,
    };
  }

  if (plano === "premium") {
    return {
      ...base,
      engorda_base: true,
      engorda_ultra: true,
      financeiro: true,
      cfo: true,
      esg: true,
      multiusuario: true,
    };
  }

  return base;
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

    // ✅ Middleware envia cookie → repassamos ao Supabase
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

          // ✅ Fonte oficial (Equação Y)
          beneficios: permissoesDoPlano("basico"),

          // ⚠️ fallback compat
          beneficios_legacy: buildBeneficiosLegacy("basico"),
        },
        { status: 200 }
      );
    }

    const userId = userData.user.id;

    // 2) Buscar assinaturas do usuário (última primeiro)
    const { data: rows, error } = await supabase
      .from("assinaturas")
      .select("id,user_id,plano_id,status,renovacao_em,fim_trial,criado_em")
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

          // ✅ Fonte oficial
          beneficios: permissoesDoPlano("basico"),
          beneficios_legacy: buildBeneficiosLegacy("basico"),
        },
        { status: 200 }
      );
    }

    // 4) Derivações (Equação Y)
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

        // ✅ PERMISSÕES CANÔNICAS
        beneficios: permissoesDoPlano(plano),

        // ⚠️ compat retroativa
        beneficios_legacy: buildBeneficiosLegacy(plano),

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
