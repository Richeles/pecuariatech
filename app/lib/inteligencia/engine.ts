// app/lib/inteligencia/engine.ts
import { createClient } from "@supabase/supabase-js";

type KPI = Record<string, any>;

function supabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, service, {
    auth: { persistSession: false },
  });
}

function safeNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pct(a: number, b: number): number {
  if (!b) return 0;
  return (a / b) * 100;
}

export async function inteligenciaFinanceiro() {
  const ts = new Date().toISOString();

  try {
    // Blindagem ENV
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return {
        ok: true,
        domain: "financeiro",
        ts,
        degraded: true,
        sinais: [],
        kpis: {},
        resumo_executivo:
          "Modo seguro: variáveis de ambiente ausentes. Nenhuma decisão deve ser tomada com este retorno.",
        reason: "missing_env",
      };
    }

    const supabase = supabaseService();

    // ==========================================================
    // 1) CFO RESUMO (âncora)
    // ==========================================================
    const { data: resumo, error: resumoErr } = await supabase
      .from("financeiro_resumo_view")
      .select("*")
      .limit(1)
      .maybeSingle();

    // ==========================================================
    // 2) DRE (12 meses) — coluna correta: mes_referencia
    // ==========================================================
    const { data: dre, error: dreErr } = await supabase
      .from("dre_mensal_view")
      .select("*")
      .order("mes_referencia", { ascending: false })
      .limit(12);

    // Se falhar qualquer consulta, ainda retorna modo seguro
    if (resumoErr || dreErr) {
      return {
        ok: true,
        domain: "financeiro",
        ts,
        degraded: true,
        sinais: [],
        kpis: {},
        resumo_executivo:
          "Modo seguro: erro na leitura das views financeiras. Nenhuma decisão deve ser tomada com este retorno.",
        reason: "views_query_error",
        detail: resumoErr?.message ?? dreErr?.message,
      };
    }

    // Se não há dados, modo seguro também
    if (!resumo && (!dre || dre.length === 0)) {
      return {
        ok: true,
        domain: "financeiro",
        ts,
        degraded: true,
        sinais: [],
        kpis: {
          receita_total: 0,
          custos_totais: 0,
          resultado_operacional: 0,
          margem_operacional_pct: 0,
        },
        resumo_executivo:
          "Financeiro ainda sem dados suficientes. Insira receitas/despesas para liberar análises reais.",
        reason: "no_data",
      };
    }

    // ==========================================================
    // KPIs baseados no DRE
    // ==========================================================
    const dreAtual = dre?.[0] ?? null;

    const receita_total = safeNumber(dreAtual?.receita_bruta);
    const custos_totais = safeNumber(dreAtual?.despesas_operacionais);
    const resultado_operacional = safeNumber(dreAtual?.resultado_operacional);

    const margem_operacional_pct = pct(resultado_operacional, receita_total);

    // Tendência (3 meses)
    const m0 = safeNumber(dre?.[0]?.resultado_operacional);
    const m1 = safeNumber(dre?.[1]?.resultado_operacional);
    const m2 = safeNumber(dre?.[2]?.resultado_operacional);
    const tendencia_3m =
      m0 > m1 && m1 > m2 ? "subindo" : m0 < m1 && m1 < m2 ? "caindo" : "misto";

    // Sinais / Alertas
    const sinais: any[] = [];

    if (resultado_operacional < 0) {
      sinais.push({
        tipo: "alerta",
        codigo: "resultado_negativo",
        mensagem:
          "Resultado operacional negativo no mês. Rever despesas operacionais e fluxo de caixa.",
        severidade: "alta",
      });
    }

    if (margem_operacional_pct < 5 && receita_total > 0) {
      sinais.push({
        tipo: "risco",
        codigo: "margem_baixa",
        mensagem:
          "Margem operacional muito baixa. Avaliar eficiência do sistema e custos variáveis.",
        severidade: "media",
      });
    }

    // CFO resumo se existir
    const saldo_caixa = safeNumber(resumo?.saldo_caixa ?? resumo?.caixa ?? 0);
    const divida_total = safeNumber(resumo?.divida_total ?? 0);

    const kpis: KPI = {
      receita_total,
      custos_totais,
      resultado_operacional,
      margem_operacional_pct: Number(margem_operacional_pct.toFixed(2)),
      saldo_caixa,
      divida_total,
      tendencia_3m,
      degraded: false,
    };

    // Resumo executivo
    const resumo_executivo =
      resultado_operacional < 0
        ? "Financeiro em alerta: resultado operacional negativo. Cortar desperdícios e revisar despesas fixas."
        : "Financeiro saudável no momento. Monitorar margem, caixa e tendência do DRE mensal.";

    return {
      ok: true,
      domain: "financeiro",
      ts,
      degraded: false,
      kpis,
      sinais,
      resumo_executivo,
    };
  } catch (e: any) {
    return {
      ok: true,
      domain: "financeiro",
      ts,
      degraded: true,
      sinais: [],
      kpis: {},
      resumo_executivo:
        "Modo seguro: erro interno na coleta. Nenhuma decisão deve ser tomada com este retorno.",
      reason: "internal_error",
      error: e?.message ?? String(e),
    };
  }
}
