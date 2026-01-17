// app/lib/inteligencia/engine.ts
// CFO EXECUTIVO REAL — Motor de Inteligência (Equação Y + Triângulo 360)
// Regra: sempre VIEW canônica (dre_mensal_gerencial_view)
// Regra: nunca quebrar produção: degraded=true em qualquer falha
// Regra: NÃO usar "@/app/lib/supabase-server" (banido no projeto)

import { createClient } from "@supabase/supabase-js";

type Eixo360 = "contabil" | "operacional" | "estrategico";

type SinalCFO = {
  eixo: Eixo360;
  tipo: "alerta" | "info";
  codigo: string;
  severidade: "alta" | "media" | "baixa";
  prioridade: 1 | 2 | 3 | 4 | 5;
  mensagem: string;
  acao_sugerida?: string;
};

type CFOResponse = {
  ok: boolean;
  domain: "financeiro";
  ts: string;
  degraded: boolean;
  kpis: {
    receita_total: number;
    custos_totais: number;
    resultado_operacional: number;
    margem_operacional_pct: number;
    saldo_caixa?: number;
    divida_total?: number;
    tendencia_3m?: string;
  };
  sinais: SinalCFO[];
  plano_acao: Array<{
    prioridade: 1 | 2 | 3;
    eixo: Eixo360;
    titulo: string;
    descricao: string;
    impacto_estimado_brl?: number;
  }>;
  resumo_executivo: string;
  error?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function n(v: any): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function brlFormat(v: number) {
  try {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${v}`;
  }
}

function makeSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !service) {
    throw new Error("missing_env_supabase_url_or_service_role");
  }

  // Service Role apenas para leitura canônica de VIEW (read-only)
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function top3PlanoAcao(sinais: SinalCFO[], kpis: CFOResponse["kpis"]) {
  const ranked = [...sinais].sort((a, b) => {
    const sev = (s: string) => (s === "alta" ? 0 : s === "media" ? 1 : 2);
    const s1 = sev(a.severidade) - sev(b.severidade);
    if (s1 !== 0) return s1;
    return a.prioridade - b.prioridade;
  });

  const actions: CFOResponse["plano_acao"] = [];

  for (const s of ranked) {
    if (actions.length >= 3) break;
    if (!s.acao_sugerida) continue;

    const titulo =
      s.eixo === "contabil"
        ? "Ajuste contábil/gerencial imediato"
        : s.eixo === "operacional"
        ? "Eficiência operacional"
        : "Decisão estratégica do CFO";

    actions.push({
      prioridade: (actions.length + 1) as 1 | 2 | 3,
      eixo: s.eixo,
      titulo,
      descricao: s.acao_sugerida,
      impacto_estimado_brl:
        s.codigo === "resultado_negativo"
          ? Math.max(0, n(kpis.custos_totais) * 0.15)
          : undefined,
    });
  }

  if (actions.length === 0) {
    actions.push({
      prioridade: 1,
      eixo: "estrategico",
      titulo: "Conferir consistência financeira",
      descricao:
        "Revisar lançamentos e categorias do mês (custos e receitas) e garantir classificação correta no plano de contas.",
    });
  }

  return actions;
}

export async function inteligenciaFinanceiro(): Promise<CFOResponse> {
  try {
    const supabase = makeSupabase();

    // VIEW canônica do CFO
    const { data, error } = await supabase
      .from("dre_mensal_gerencial_view")
      .select("*")
      .order("mes_ref", { ascending: false })
      .limit(1);

    if (error) throw error;

    const row = data?.[0] || {};

    const receita_total = n(row.receita_total);
    const custos_totais = n(row.custos_totais);
    const resultado_operacional = n(row.resultado_operacional);
    const margem_operacional_pct = n(row.margem_operacional_pct);

    const saldo_caixa = row.saldo_caixa != null ? n(row.saldo_caixa) : 0;
    const divida_total = row.divida_total != null ? n(row.divida_total) : 0;
    const tendencia_3m = row.tendencia_3m != null ? String(row.tendencia_3m) : "misto";

    const kpis: CFOResponse["kpis"] = {
      receita_total,
      custos_totais,
      resultado_operacional,
      margem_operacional_pct,
      saldo_caixa,
      divida_total,
      tendencia_3m,
    };

    const sinais: SinalCFO[] = [];

    // ✅ CONTÁBIL
    if (resultado_operacional < 0) {
      sinais.push({
        eixo: "contabil",
        tipo: "alerta",
        codigo: "resultado_negativo",
        severidade: "alta",
        prioridade: 1,
        mensagem:
          "Resultado operacional negativo no mês. Rever DRE e estrutura de custos imediatamente.",
        acao_sugerida:
          `Cortar 10%–20% dos custos fixos/operacionais nos próximos 7 dias. Meta: reduzir ~${brlFormat(Math.max(0, custos_totais * 0.15))}.`,
      });
    }

    if (margem_operacional_pct <= 5 && receita_total > 0) {
      sinais.push({
        eixo: "contabil",
        tipo: "alerta",
        codigo: "margem_baixa",
        severidade: "media",
        prioridade: 2,
        mensagem:
          "Margem operacional muito baixa. O negócio está operando próximo do ponto de equilíbrio.",
        acao_sugerida:
          "Revisar categorias de maior custo, renegociar insumos/serviços e criar teto de custo por cabeça e por hectare.",
      });
    }

    // ✅ OPERACIONAL
    if (custos_totais > receita_total && receita_total > 0) {
      sinais.push({
        eixo: "operacional",
        tipo: "alerta",
        codigo: "custo_acima_receita",
        severidade: "alta",
        prioridade: 2,
        mensagem:
          "Custos totais acima da receita do mês. Há desequilíbrio operacional.",
        acao_sugerida:
          "Pente-fino em despesas recorrentes (diesel, manutenção, terceiros, energia). Travar compras não essenciais por 14 dias.",
      });
    }

    if (receita_total === 0 && custos_totais > 0) {
      sinais.push({
        eixo: "operacional",
        tipo: "alerta",
        codigo: "sem_receita_com_custos",
        severidade: "alta",
        prioridade: 1,
        mensagem:
          "Existem custos no mês, mas receita total zerada. Pode faltar lançamento ou houve período sem venda.",
        acao_sugerida:
          "Conferir lançamentos de receita. Se não houve venda, ativar plano de caixa: reduzir gastos e planejar entrada de receita no próximo ciclo.",
      });
    }

    // ✅ ESTRATÉGICO
    if (divida_total > 0 && saldo_caixa === 0) {
      sinais.push({
        eixo: "estrategico",
        tipo: "alerta",
        codigo: "divida_sem_caixa",
        severidade: "media",
        prioridade: 3,
        mensagem:
          "Há dívida registrada e o saldo de caixa está zerado. Atenção ao risco de liquidez.",
        acao_sugerida:
          "Renegociar prazos (alongamento), priorizar itens críticos e criar cronograma semanal de caixa.",
      });
    }

    if (sinais.length === 0) {
      sinais.push({
        eixo: "estrategico",
        tipo: "info",
        codigo: "estavel",
        severidade: "baixa",
        prioridade: 5,
        mensagem:
          "Sem alertas críticos. Recomenda-se manter disciplina de custos e revisão semanal de KPIs.",
        acao_sugerida:
          "Manter rotina: revisar DRE semanalmente e garantir lançamentos consistentes.",
      });
    }

    const plano_acao = top3PlanoAcao(sinais, kpis);

    const resumo_executivo =
      resultado_operacional < 0
        ? "Financeiro em alerta: resultado operacional negativo. Prioridade máxima em corte de desperdícios e revisão de despesas fixas."
        : "Financeiro estável: manter disciplina de custos, registrar receitas e acompanhar KPIs semanalmente.";

    return {
      ok: true,
      domain: "financeiro",
      ts: nowIso(),
      degraded: false,
      kpis,
      sinais,
      plano_acao,
      resumo_executivo,
    };
  } catch (err: any) {
    console.error("[CFO][engine] error:", err);

    return {
      ok: true,
      domain: "financeiro",
      ts: nowIso(),
      degraded: true,
      kpis: {
        receita_total: 0,
        custos_totais: 0,
        resultado_operacional: 0,
        margem_operacional_pct: 0,
        tendencia_3m: "misto",
      },
      sinais: [],
      plano_acao: [],
      resumo_executivo:
        "Modo seguro: erro interno na coleta. Nenhuma decisão deve ser tomada com este retorno.",
      error: err?.message || "internal_error",
    };
  }
}
