// app/api/assinaturas/status/route.ts
// Âncora SaaS de Permissão — PecuariaTech
// Equação Y: Supabase (assinaturas + planos_legacy) → API → Middleware
// Read-only | runtime-only | sem SSR | sem client global

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildBeneficios(nivel: number) {
  return {
    rebanho: true,
    pastagem: true,
    engorda: nivel >= 3,
    financeiro: nivel >= 3,
    cfo: nivel >= 5,
    esg: nivel >= 4,
    multiusuarios: nivel >= 4,
    suporte_vip: nivel >= 5,
  };
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

function normalizeNivelFromLegacy(nivel: any): number {
  const n = String(nivel ?? "").toLowerCase();
  if (n.includes("premium")) return 5;
  if (n.includes("empres")) return 4;
  if (n.includes("ultra")) return 3;
  if (n.includes("prof")) return 2;
  return 1;
}

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { ativo: false, error: "missing env vars" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { ativo: false, error: "missing bearer token" },
        { status: 401 }
      );
    }

    // Admin client (service role) — apenas dentro do handler
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 1) validar token e obter user_id real
    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData?.user?.id) {
      return NextResponse.json(
        { ativo: false, error: "invalid token" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // 2) buscar assinatura ativa
    const { data: assinatura, error: assErr } = await supabaseAdmin
      .from("assinaturas")
      .select("id, user_id, plano_id, status, criado_em, atualizado_em, fim_trial, renovacao_em")
      .eq("user_id", userId)
      .eq("status", "ativa")
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assErr) {
      return NextResponse.json(
        { ativo: false, error: "db error (assinaturas)", details: assErr.message },
        { status: 500 }
      );
    }

    if (!assinatura?.id) {
      return NextResponse.json({
        ativo: false,
        plano: "basico",
        nivel: 1,
        beneficios: buildBeneficios(1),
        expires_at: null,
      });
    }

    // 3) buscar plano na tabela correta: planos_legacy (FK real)
    let planoLegacy: any = null;

    if (assinatura.plano_id) {
      const { data: planoRow } = await supabaseAdmin
        .from("planos_legacy")
        .select("id, nome, nivel, periodicidade, preco")
        .eq("id", assinatura.plano_id)
        .maybeSingle();

      planoLegacy = planoRow ?? null;
    }

    const nivel = normalizeNivelFromLegacy(planoLegacy?.nivel);
    const plano = String(planoLegacy?.nivel ?? "basico");

    return NextResponse.json({
      ativo: true,
      plano,
      nivel,
      beneficios: buildBeneficios(nivel),
      expires_at: assinatura.renovacao_em ?? assinatura.fim_trial ?? null,
      assinatura: {
        id: assinatura.id,
        plano_id: assinatura.plano_id,
        criado_em: assinatura.criado_em,
        atualizado_em: assinatura.atualizado_em,
      },
      plano_legacy: planoLegacy,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ativo: false, error: "unhandled", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
