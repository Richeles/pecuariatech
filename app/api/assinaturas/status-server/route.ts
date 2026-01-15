// app/api/assinaturas/status-server/route.ts
// SaaS por Plano — Âncora de Permissão (Equação Y)
// Server-friendly: usa cookie do Supabase (não Bearer)
// Fonte: public.assinaturas (gravada pelo webhook Mercado Pago)
//
// Regras:
// - read-only
// - anti-quebra: não depende de colunas inexistentes
// - compatível com middleware

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Normaliza status vindo do banco
function isAtiva(status: any): boolean {
  const v = String(status ?? "").toLowerCase().trim();
  return v === "ativa" || v.includes("ativa") || v === "active";
}

// Plano por ID (âncora)
// Agora: como sua tabela só tem plano_id (uuid) e você ainda não mostrou
// a tabela/view de planos com uuid -> slug, vamos derivar nível por fallback seguro.
// Quando você confirmar o "mapa de plano_id", a gente fecha isso perfeito.
function planoFromPlanoId(_planoId: any): "basico" | "pro" | "premium" {
  // 🔒 fallback seguro até mapear os UUIDs reais
  return "basico";
}

function planoToNivel(plano: "basico" | "pro" | "premium") {
  if (plano === "premium") return 3;
  if (plano === "pro") return 2;
  return 1;
}

function buildBeneficios(plano: "basico" | "pro" | "premium") {
  // Internacional / modular (fácil de evoluir sem quebrar middleware)
  const base = {
    rebanho: true,
    pastagem: true,
    engorda: false,
    financeiro: false,
    cfo: false,
    esg: false,
    multiusuario: false,
  };

  if (plano === "pro") {
    return {
      ...base,
      engorda: true,
      financeiro: true,
    };
  }

  if (plano === "premium") {
    return {
      ...base,
      engorda: true,
      financeiro: true,
      cfo: true,
      esg: true,
      multiusuario: true,
    };
  }

  return base;
}

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

    // ✅ Middleware envia cookies. Vamos repassar cookies para o Supabase.
    const cookie = req.headers.get("cookie") ?? "";

    const supabase = createClient(url, anon, {
      global: {
        headers: {
          cookie,
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) validar usuário por sessão (cookie)
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return NextResponse.json(
        { ativo: false, plano: "basico", nivel: 1, expires_at: null, beneficios: buildBeneficios("basico") },
        { status: 200 }
      );
    }

    const userId = userData.user.id;

    // 2) buscar última assinatura deste user_id
    // Seu schema tem criado_em. Então ordenamos por criado_em DESC.
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

    // 3) sem assinatura ativa -> ativo false
    if (!active) {
      return NextResponse.json(
        {
          ativo: false,
          plano: "basico",
          nivel: 1,
          expires_at: null,
          beneficios: buildBeneficios("basico"),
        },
        { status: 200 }
      );
    }

    // 4) derivar plano e vencimento
    const plano = planoFromPlanoId(active.plano_id);
    const nivel = planoToNivel(plano);

    // expires_at: usamos renovacao_em primeiro, senão fim_trial
    const expires_at = active.renovacao_em ?? active.fim_trial ?? null;

    return NextResponse.json(
      {
        ativo: true,
        plano,
        nivel,
        expires_at,
        plano_id: active.plano_id ?? null,
        beneficios: buildBeneficios(plano),
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
