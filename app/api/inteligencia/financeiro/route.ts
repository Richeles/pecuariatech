// app/api/inteligencia/financeiro/route.ts
// Inteligência Financeira (CFO Agro) — read-only
// Fonte Única (Equação Y): views financeiro_resumo_view + dre_mensal_view
// Regra: nunca 500 seco.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  IntelligenceResponse,
  mkSignal,
  clamp,
} from "@/app/lib/inteligencia/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

function buildSupabaseSSR() {
  const cookieStore = cookies();
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

export async function GET() {
  try {
    const supabase = buildSupabaseSSR();

    // Sessão via cookie SSR
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user?.id) {
      return json({ ok: false, error: "no_session" }, 401);
    }

    // 1) KPIs base (âncora): financeiro_resumo_view
    const { data: resumo, error: resumoErr } = await supabase
      .from("financeiro_resumo_view")
      .select("*")
      .limit(1)
      .maybeSingle();

    // 2) DRE mensal: dre_mensal_view
    const { data: dre, error: dreErr } = await supabase
      .from("dre_mensal_view")
      .select("*")
      .order("mes_ref", { ascending: false })
      .limit(6);

    // Falhou? Não derrubar — responder degradado
    const degraded = Boolean(resumoErr || dreErr);

    // ======= Normalização defensiva =======
    const receita = Number(resumo?.receita_total ?? 0);
    const custos = Number(resumo?.custos_totais ?? 0);
    const margem = receita > 0 ? ((receita - custos) / receita) * 100 : 0;

    const caixa = Number(resumo?.saldo_caixa ?? resumo?.caixa ?? 0);
    const endividamento = Number(resumo?.divida_total ?? 0);

    const sinais = [];

    // ALERTA 1: margem baixa
    if (margem > 0 && margem < 12) {
      sinais.push(
        mkSignal({
          domain: "financeiro",
          severity: "warning",
          titulo: "Margem operacional baixa",
          descricao: `Sua margem estimada está em ${margem.toFixed(
            1
          )}%. Risco de perda de caixa.`,
          acao_recomendada:
            "Revisar custo por cabeça/dia, renegociar insumos e priorizar giro de estoque. Ativar modo ‘segurar caixa’.",
          metric: { nome: "margem_operacional", valor: margem, unidade: "%" },
          risco_score: clamp(70),
          confianca_score: clamp(75),
          origem: { view: "financeiro_resumo_view" },
        })
      );
    }

    // ALERTA 2: caixa muito baixo
    if (caixa > 0 && receita > 0 && caixa < receita * 0.05) {
      sinais.push(
        mkSignal({
          domain: "financeiro",
          severity: "critical",
          titulo: "Caixa crítico",
          descricao: "O saldo de caixa está desproporcional ao volume da operação.",
          acao_recomendada:
            "Suspender despesas não essenciais, antecipar recebíveis e revisar cronograma de pagamentos.",
          metric: { nome: "saldo_caixa", valor: caixa, unidade: "R$" },
          risco_score: clamp(85),
          confianca_score: clamp(70),
          origem: { view: "financeiro_resumo_view" },
        })
      );
    }

    // ALERTA 3: dívida alta vs receita
    if (endividamento > 0 && receita > 0 && endividamento > receita * 1.5) {
      sinais.push(
        mkSignal({
          domain: "financeiro",
          severity: "warning",
          titulo: "Endividamento elevado",
          descricao:
            "A dívida está alta em relação à receita operacional. Pode comprometer reinvestimento e giro.",
          acao_recomendada:
            "Reestruturar prazos, reduzir custo fixo e priorizar investimentos com ROI curto.",
          metric: { nome: "divida_total", valor: endividamento, unidade: "R$" },
          risco_score: clamp(75),
          confianca_score: clamp(65),
          origem: { view: "financeiro_resumo_view" },
        })
      );
    }

    const resp: IntelligenceResponse = {
      ok: true,
      domain: "financeiro",
      ts: new Date().toISOString(),
      kpis: {
        receita_total: receita,
        custos_totais: custos,
        margem_operacional_pct: Number(margem.toFixed(2)),
        saldo_caixa: caixa,
        divida_total: endividamento,
        degraded,
      },
      sinais,
      resumo_executivo:
        sinais.length === 0
          ? "Financeiro está estável no momento. Monitorar margem, caixa e tendência do DRE mensal."
          : "Foram detectados sinais de atenção no financeiro. Aja primeiro em caixa e margem antes de expandir custos.",
    };

    return json(resp, 200);
  } catch (e: any) {
    return json(
      {
        ok: true,
        domain: "financeiro",
        degraded: true,
        sinais: [],
        kpis: {},
        resumo_executivo:
          "Modo seguro: erro interno na coleta. Nenhuma decisão deve ser tomada com este retorno.",
        error: e?.message ?? String(e),
      },
      200
    );
  }
}
