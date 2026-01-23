// app/api/assinaturas/status/route.ts
// PecuariaTech — Status canônico (SSR cookie-first)
// Compatível com schema real: assinaturas.criado_em / atualizado_em / plano_id
// Regra Z correta: auth/erro técnico => reason=no_session/internal_error => middleware manda /login
// Apenas assinatura realmente inativa => reason=assinatura_inativa => middleware manda /planos

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonNoStore(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isAtiva(status?: string | null) {
  const s = String(status ?? "").toLowerCase().trim();
  return s === "ativa" || s === "ativo" || s === "active";
}

export async function GET() {
  const ts = new Date().toISOString();

  try {
    const cookieStore = await cookies();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return jsonNoStore(
        { ok: true, ativo: false, health: "degraded", reason: "missing_env", ts },
        200
      );
    }

    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // endpoint read-only
        },
      },
    });

    // 1) auth cookie-first
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authErr || !user) {
      return jsonNoStore(
        { ok: true, ativo: false, health: "ok", reason: "no_session", ts },
        200
      );
    }

    // 2) assinatura mais recente por user_id
    // OBS: schema real usa atualizado_em/criado_em (não created_at/updated_at)
    const { data: assinatura, error: assErr } = await supabase
      .from("assinaturas")
      .select(
        `
        id,
        user_id,
        plano_id,
        status,
        metodo_pagamento,
        valor,
        inicio_trial,
        fim_trial,
        renovacao_em,
        criado_em,
        atualizado_em,
        expires_at
        `
      )
      .eq("user_id", user.id)
      .order("atualizado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assErr) {
      return jsonNoStore(
        {
          ok: true,
          ativo: false,
          locked: true,
          health: "degraded",
          reason: "assinaturas_query_error",
          supabase_error: assErr.message,
          ts,
        },
        200
      );
    }

    const status = assinatura?.status ?? null;
    const ativo = isAtiva(status);

    // 3) buscar dados do plano via plano_id
    // view/tabela esperada: planos_legacy (ou planos)
    // fallback: se não existir, devolve mínimo.
    let plano_nome: string | null = null;
    let plano_nivel: string | null = null;
    let beneficios: any = null;

    if (assinatura?.plano_id) {
      const { data: planoData } = await supabase
        .from("planos_legacy")
        .select("nome, nivel, beneficios")
        .eq("id", assinatura.plano_id)
        .maybeSingle();

      if (planoData) {
        plano_nome = planoData.nome ?? null;
        plano_nivel = planoData.nivel ?? null;
        beneficios = planoData.beneficios ?? null;
      }
    }

    // 4) assinatura inativa real => /planos
    if (!ativo) {
      return jsonNoStore(
        {
          ok: true,
          ativo: false,
          locked: true,
          health: "ok",
          reason: "assinatura_inativa",
          status,
          user_id: user.id,
          plano_id: assinatura?.plano_id ?? null,
          plano_nome,
          plano_nivel,
          beneficios,
          ts,
        },
        200
      );
    }

    // 5) assinatura ativa => liberar
    return jsonNoStore(
      {
        ok: true,
        ativo: true,
        locked: false,
        health: "ok",
        reason: "ok",
        status,
        user_id: user.id,
        assinatura_id: assinatura?.id ?? null,
        plano_id: assinatura?.plano_id ?? null,
        plano_nome,
        plano_nivel,
        beneficios,
        ts,
      },
      200
    );
  } catch (err: any) {
    return jsonNoStore(
      {
        ok: true,
        ativo: false,
        locked: true,
        health: "degraded",
        reason: "internal_error",
        message: String(err?.message ?? err),
        ts,
      },
      200
    );
  }
}
