// app/api/assinaturas/status/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

type HealthStatus = "ok" | "degraded";
type SourceStatus = "anchor" | "view" | "fallback";

function jsonOk(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

async function buildSupabaseSSR() {
  // ✅ Next.js 16: cookies() pode ser async
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

function asNivelFromPlano(plano: any): string | null {
  const candidates = [
    plano?.nivel,
    plano?.plano_nivel,
    plano?.slug,
    plano?.codigo,
    plano?.nome,
    plano?.name,
    plano?.title,
  ]
    .filter(Boolean)
    .map((v: any) => String(v).toLowerCase());

  if (candidates.some((v: string) => v.includes("ultra"))) return "ultra";
  if (candidates.some((v: string) => v.includes("premium"))) return "premium";
  if (candidates.some((v: string) => v.includes("pro"))) return "pro";
  if (candidates.some((v: string) => v.includes("basic"))) return "basic";
  return candidates[0] ?? null;
}

export async function GET() {
  try {
    // 0) sanity env
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return jsonOk({
        ok: true,
        ativo: false,
        status: "inativa",
        health: "degraded" as HealthStatus,
        source: "fallback" as SourceStatus,
        reason: "missing_env",
      });
    }

    const supabase = await buildSupabaseSSR();

    // 1) sessão via COOKIE SSR (Padrão PecuariaTech)
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return jsonOk({
        ok: true,
        ativo: false,
        status: "inativa",
        health: "ok" as HealthStatus,
        source: "fallback" as SourceStatus,
        reason: "no_session",
      });
    }

    const user = userData.user;

    // =====================================================================
    // VIEW opcional (não pode quebrar SaaS)
    // =====================================================================
    try {
      const { data: viewData, error: viewErr } = await supabase
        .from("assinatura_ativa_view")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (viewErr) throw viewErr;

      if (viewData) {
        const ativo =
          Boolean(viewData.ativo) ||
          viewData.status === "ativa" ||
          viewData.status === "active";

        return jsonOk({
          ok: true,
          ativo,
          status: viewData.status ?? (ativo ? "ativa" : "inativa"),
          user_id: user.id,

          plano_id: viewData.plano_id ?? null,
          plano_nome: viewData.plano_nome ?? null,
          plano_nivel: viewData.plano_nivel ?? null,
          periodicidade: viewData.periodicidade ?? null,
          plano_preco: viewData.plano_preco ?? null,
          beneficios: viewData.beneficios ?? null,
          expires_at: viewData.expires_at ?? null,

          metodo_pagamento: viewData.metodo_pagamento ?? null,
          valor: viewData.valor ?? null,
          inicio_trial: viewData.inicio_trial ?? null,
          fim_trial: viewData.fim_trial ?? null,
          renovacao_em: viewData.renovacao_em ?? null,

          health: "ok" as HealthStatus,
          source: "view" as SourceStatus,
          ts: new Date().toISOString(),
        });
      }
    } catch {
      // view falhou -> segue âncora
    }

    // =====================================================================
    // ÂNCORA DEFINITIVA: tabela assinaturas + join planos_legacy
    // =====================================================================
    const { data: assinaturaData, error: assinaturaErr } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("user_id", user.id)
      .order("atualizado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assinaturaErr) {
      return jsonOk({
        ok: true,
        ativo: false,
        status: "inativa",
        user_id: user.id,
        source: "fallback" as SourceStatus,
        health: "degraded" as HealthStatus,
        reason: "assinaturas_query_error",
        detail: assinaturaErr.message,
        ts: new Date().toISOString(),
      });
    }

    if (!assinaturaData) {
      return jsonOk({
        ok: true,
        ativo: false,
        status: "inativa",
        user_id: user.id,
        source: "fallback" as SourceStatus,
        health: "ok" as HealthStatus,
        reason: "no_subscription",
        ts: new Date().toISOString(),
      });
    }

    const status = assinaturaData.status ?? "inativa";
    const ativo = status === "ativa" || status === "active";

    const plano_id: string | null = assinaturaData.plano_id ?? null;

    let plano_nome: string | null =
      assinaturaData.plano_nome ?? assinaturaData.plano ?? null;

    let plano_nivel: string | null =
      assinaturaData.plano_nivel ?? assinaturaData.nivel ?? null;

    let periodicidade: string | null =
      assinaturaData.periodicidade ?? assinaturaData.ciclo ?? null;

    let plano_preco: number | null = assinaturaData.plano_preco ?? null;

    let beneficios: any = assinaturaData.beneficios ?? null;

    // join plano (planos_legacy)
    if (plano_id) {
      const { data: planoData, error: planoErr } = await supabase
        .from("planos_legacy")
        .select("*")
        .eq("id", plano_id)
        .limit(1)
        .maybeSingle();

      if (!planoErr && planoData) {
        plano_nome = plano_nome ?? (planoData.nome ?? planoData.name ?? null);
        plano_nivel =
          plano_nivel ??
          planoData.nivel ??
          planoData.plano_nivel ??
          asNivelFromPlano(planoData);

        periodicidade =
          periodicidade ??
          planoData.periodicidade ??
          planoData.billing_cycle ??
          planoData.ciclo ??
          null;

        plano_preco =
          plano_preco ?? (planoData.preco ?? planoData.valor ?? null);

        beneficios =
          beneficios ??
          planoData.beneficios ??
          planoData.benefits ??
          planoData.features ??
          null;
      }
    }

    return jsonOk({
      ok: true,
      ativo,
      status,
      user_id: user.id,

      plano_id,
      plano_nome,
      plano_nivel,
      periodicidade,
      plano_preco,
      beneficios,

      metodo_pagamento: assinaturaData.metodo_pagamento ?? null,
      valor: assinaturaData.valor ?? null,
      inicio_trial: assinaturaData.inicio_trial ?? null,
      fim_trial: assinaturaData.fim_trial ?? null,
      renovacao_em: assinaturaData.renovacao_em ?? null,
      expires_at: assinaturaData.expires_at ?? null,

      health: "ok" as HealthStatus,
      source: "anchor" as SourceStatus,
      ts: new Date().toISOString(),
    });
  } catch (e: any) {
    return jsonOk({
      ok: true,
      ativo: false,
      status: "inativa",
      health: "degraded" as HealthStatus,
      source: "fallback" as SourceStatus,
      reason: "internal_error",
      detail: e?.message ?? String(e),
      ts: new Date().toISOString(),
    });
  }
}
