// app/api/financeiro/planilha/route.ts
// PecuariaTech — Planilha Financeira (Progressiva por Plano)
//
// ✅ Equação Y: assinatura_ativa_view (âncora) -> fallback assinaturas
// ✅ Dados REAIS: tabela âncora financeiro_lancamentos (NUNCA views por plano)
// ✅ Financeiro progressivo: qualquer plano ATIVO => locked:false
// ✅ Regra Z: sempre JSON (erro técnico vira degraded, não quebra UI)
// ✅ SSR cookie-first (Next 16 + @supabase/ssr)

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

type NivelPlano = "basico" | "profissional" | "ultra" | "empresarial" | "premium";

type PlanilhaRow = {
  id: string;
  data: string; // date
  tipo: string;
  valor: number;
  categoria: string | null;
  descricao: string | null;
};

type PlanilhaResponse = {
  ok: true;
  ativo: true;
  plano: string;
  nivel: NivelPlano;

  // ✅ Financeiro progressivo: qualquer plano ATIVO entra
  locked: false;

  template: string;
  sections: string[];
  features: Record<string, boolean>;

  limit_rows: number;
  allow_export: boolean;

  // ✅ DADOS REAIS
  rows: PlanilhaRow[];

  // ✅ modo degradado sem quebrar UI
  degraded?: boolean;
  reason?: string;

  ts: string;
};

function jsonNoCache(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

function normalizeAtiva(status?: string | null) {
  const s = String(status ?? "").toLowerCase().trim();
  return s === "ativa" || s === "ativo" || s === "active";
}

function nivelFromPlano(plano: string | null | undefined): NivelPlano {
  const p = String(plano ?? "").toLowerCase();
  if (p.includes("premium") || p.includes("dominus")) return "premium";
  if (p.includes("empres")) return "empresarial";
  if (p.includes("ultra")) return "ultra";
  if (p.includes("prof")) return "profissional";
  return "basico";
}

function planilhaModel(nivel: NivelPlano) {
  switch (nivel) {
    case "premium":
      return {
        template: "premium_dominus_360",
        sections: [
          "DRE Automática (mensal/anual)",
          "Fluxo de Caixa (direto/indireto)",
          "Centro de Custos avançado",
          "Custo por Arroba real + projetado",
          "KPIs CFO 360",
          "Cenários + Stress Test",
          "Exportação + auditoria",
        ],
        features: {
          dre: true,
          fluxo_caixa: true,
          centro_custos: true,
          custo_arroba: true,
          alertas: true,
          cenarios: true,
          stress_test: true,
          exportacao: true,
        },
        limit_rows: 2000,
        allow_export: true,
      };

    case "empresarial":
      return {
        template: "empresarial",
        sections: [
          "DRE Completa",
          "Fluxo de Caixa",
          "Centro de Custos",
          "Orçado vs Realizado",
          "Exportação",
        ],
        features: {
          dre: true,
          fluxo_caixa: true,
          centro_custos: true,
          custo_arroba: true,
          alertas: true,
          cenarios: false,
          stress_test: false,
          exportacao: true,
        },
        limit_rows: 1200,
        allow_export: true,
      };

    case "ultra":
      return {
        template: "ultra",
        sections: [
          "DRE Completa",
          "Fluxo de Caixa",
          "Margem + EBITDA",
          "Alertas financeiros",
          "Custo por Arroba",
        ],
        features: {
          dre: true,
          fluxo_caixa: true,
          centro_custos: false,
          custo_arroba: true,
          alertas: true,
          cenarios: false,
          stress_test: false,
          exportacao: true,
        },
        limit_rows: 800,
        allow_export: true,
      };

    case "profissional":
      return {
        template: "profissional",
        sections: ["DRE", "Fluxo de Caixa", "Indicadores", "Exportação"],
        features: {
          dre: true,
          fluxo_caixa: true,
          centro_custos: false,
          custo_arroba: false,
          alertas: false,
          cenarios: false,
          stress_test: false,
          exportacao: true,
        },
        limit_rows: 400,
        allow_export: true,
      };

    default:
      return {
        template: "basico",
        sections: ["Receitas", "Custos", "Resultado", "Margem"],
        features: {
          dre: true,
          fluxo_caixa: false,
          centro_custos: false,
          custo_arroba: false,
          alertas: false,
          cenarios: false,
          stress_test: false,
          exportacao: false,
        },
        limit_rows: 120,
        allow_export: false,
      };
  }
}

async function buildSupabaseSSR() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) throw new Error("missing_env");

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // não pode quebrar handler
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // não pode quebrar handler
        }
      },
    },
  });
}

async function getPlanoNivelByEquacaoY(
  supabase: any,
  userId: string
): Promise<{ plano: string; nivel: NivelPlano }> {
  // ✅ 1) Fonte canônica
  const view = await supabase
    .from("assinatura_ativa_view")
    .select("status, plano, nivel")
    .eq("user_id", userId)
    .maybeSingle();

  if (!view.error && view.data) {
    const ativo = normalizeAtiva(view.data.status);
    if (!ativo) throw new Error("assinatura_inativa");

    const plano = String(view.data.plano ?? "basico");
    const nivel = (view.data.nivel as NivelPlano) ?? nivelFromPlano(plano);

    return { plano, nivel };
  }

  // ✅ 2) fallback compatível
  const ass = await supabase
    .from("assinaturas")
    .select("status, plano, plano_nome, plano_nivel, atualizado_em")
    .eq("user_id", userId)
    .order("atualizado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ass.error) throw new Error("status_unavailable");

  const ativo = normalizeAtiva(ass.data?.status);
  if (!ativo) throw new Error("assinatura_inativa");

  const plano =
    (ass.data?.plano_nome as string) ||
    (ass.data?.plano as string) ||
    (ass.data?.plano_nivel as string) ||
    "basico";

  const nivel = (ass.data?.plano_nivel as NivelPlano) || nivelFromPlano(plano);

  return { plano, nivel };
}

async function loadLancamentos(
  supabase: any,
  userId: string,
  limitRows: number
): Promise<{ rows: PlanilhaRow[]; degraded?: boolean; reason?: string }> {
  // ✅ DADOS REAIS (âncora): financeiro_lancamentos
  // ✅ Importante: NÃO usar views "financeiro_*_view"

  try {
    const q = await supabase
      .from("financeiro_lancamentos")
      .select("id,data,tipo,valor,categoria,descricao,criado_em")
      .eq("user_id", userId)
      .order("criado_em", { ascending: false }) // ✅ coluna confirmada existente
      .limit(limitRows);

    if (q.error) {
      return {
        rows: [],
        degraded: true,
        reason: `financeiro_query_error: ${q.error.message}`,
      };
    }

    // ✅ Se não tem lançamentos, isso NÃO é erro.
    return { rows: (q.data ?? []) as PlanilhaRow[] };
  } catch (e: any) {
    return {
      rows: [],
      degraded: true,
      reason: `financeiro_exception: ${String(e?.message ?? e)}`,
    };
  }
}

export async function GET() {
  try {
    // sanity env
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return jsonNoCache({ ok: false, reason: "missing_env" }, 500);
    }

    const supabase = await buildSupabaseSSR();

    // 1) Auth cookie SSR first
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return jsonNoCache({ ok: false, reason: "no_session" }, 401);
    }

    const userId = userData.user.id;

    // 2) Equação Y (plano/nivel)
    let plano = "basico";
    let nivel: NivelPlano = "basico";

    try {
      const eqY = await getPlanoNivelByEquacaoY(supabase, userId);
      plano = eqY.plano;
      nivel = eqY.nivel;
    } catch (e: any) {
      const msg = String(e?.message ?? e);

      if (msg.includes("assinatura_inativa")) {
        return jsonNoCache({ ok: false, reason: "assinatura_inativa" }, 403);
      }

      // Regra Z: erro técnico não vira "upgrade"
      plano = "basico";
      nivel = "basico";
    }

    const model = planilhaModel(nivel);

    // 3) Dados reais
    const data = await loadLancamentos(supabase, userId, model.limit_rows);

    const payload: PlanilhaResponse = {
      ok: true,
      ativo: true,
      plano,
      nivel,
      locked: false,
      template: model.template,
      sections: model.sections,
      features: model.features,
      limit_rows: model.limit_rows,
      allow_export: model.allow_export,
      rows: data.rows,
      degraded: data.degraded,
      reason: data.reason,
      ts: new Date().toISOString(),
    };

    return jsonNoCache(payload, 200);
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.includes("missing_env")) return jsonNoCache({ ok: false, reason: "missing_env" }, 500);
    return jsonNoCache({ ok: false, reason: "internal_error", message: msg }, 500);
  }
}
