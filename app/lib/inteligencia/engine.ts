// app/lib/inteligencia/engine.ts
// CFO EXECUTIVO REAL — Motor Cognitivo Financeiro
// Equação Y + Equação Z + Triângulo 360
// Runtime Cognitivo Premium Internacional
// Regra:
// - engine NÃO acessa Supabase diretamente
// - engine NÃO usa fetch interno
// - engine NÃO usa HTTP localhost
// - engine recebe snapshot limpo via service layer
// - fail-safe obrigatório (degraded mode)

import {
  getFinanceiroSnapshot,
} from "@/app/services/financeiro/getFinanceiroSnapshot";

/* =====================================================
   TYPES
===================================================== */

type Eixo360 =
  | "contabil"
  | "operacional"
  | "estrategico";

type SinalCFO = {
  eixo: Eixo360;

  tipo:
    | "alerta"
    | "info";

  codigo: string;

  severidade:
    | "alta"
    | "media"
    | "baixa";

  prioridade:
    | 1
    | 2
    | 3
    | 4
    | 5;

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
    prioridade:
      | 1
      | 2
      | 3;

    eixo: Eixo360;

    titulo: string;

    descricao: string;

    impacto_estimado_brl?: number;
  }>;

  resumo_executivo: string;

  metadata?: {
    runtime?: string;

    analytics_ready?: boolean;

    python_ready?: boolean;
  };

  error?: string;
};

/* =====================================================
   HELPERS
===================================================== */

function nowIso() {

  return new Date()
    .toISOString();
}

function n(v: any): number {

  const x = Number(v);

  return Number.isFinite(x)
    ? x
    : 0;
}

function brlFormat(v: number) {

  try {

    return v.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );

  } catch {

    return `R$ ${v}`;

  }
}

/* =====================================================
   SCORE ENGINE
===================================================== */

function riscoOperacionalScore(
  receita_total: number,
  custos_totais: number,
  resultado_operacional: number,
  saldo_caixa: number,
  divida_total: number
) {

  let score = 0;

  if (
    resultado_operacional < 0
  ) {
    score += 35;
  }

  if (
    custos_totais >
    receita_total
  ) {
    score += 25;
  }

  if (
    saldo_caixa <= 0
  ) {
    score += 20;
  }

  if (
    divida_total >
    saldo_caixa
  ) {
    score += 20;
  }

  return Math.min(
    score,
    100
  );
}

/* =====================================================
   PLANO AÇÃO
===================================================== */

function top3PlanoAcao(
  sinais: SinalCFO[],
  kpis: CFOResponse["kpis"]
) {

  const ranked =
    [...sinais].sort(
      (a, b) => {

        const sev = (
          x: string
        ) =>
          x === "alta"
            ? 0
            : x === "media"
            ? 1
            : 2;

        const s1 =
          sev(a.severidade) -
          sev(b.severidade);

        if (s1 !== 0) {
          return s1;
        }

        return (
          a.prioridade -
          b.prioridade
        );
      }
    );

  const actions:
    CFOResponse["plano_acao"] =
      [];

  for (const s of ranked) {

    if (
      actions.length >= 3
    ) {
      break;
    }

    if (
      !s.acao_sugerida
    ) {
      continue;
    }

    const titulo =
      s.eixo === "contabil"
        ? "Ajuste contábil imediato"
        : s.eixo ===
          "operacional"
        ? "Eficiência operacional"
        : "Decisão estratégica";

    actions.push({

      prioridade:
        (
          actions.length + 1
        ) as 1 | 2 | 3,

      eixo: s.eixo,

      titulo,

      descricao:
        s.acao_sugerida,

      impacto_estimado_brl:
        s.codigo ===
        "resultado_negativo"
          ? Math.max(
              0,
              n(
                kpis.custos_totais
              ) * 0.15
            )
          : undefined,
    });
  }

  if (
    actions.length === 0
  ) {

    actions.push({
      prioridade: 1,

      eixo: "estrategico",

      titulo:
        "Conferir consistência financeira",

      descricao:
        "Revisar lançamentos financeiros e garantir classificação correta de custos e receitas.",
    });
  }

  return actions;
}

/* =====================================================
   ENGINE
===================================================== */

export async function inteligenciaFinanceiro():
Promise<CFOResponse> {

  try {

    /* =====================================================
       SNAPSHOT
    ===================================================== */

    const snapshot =
      await getFinanceiroSnapshot();

    const {

      receita_total,

      custos_totais,

      resultado_operacional,

      margem_operacional_pct,

      saldo_caixa,

      divida_total,

      tendencia_3m,

    } = snapshot;

    /* =====================================================
       KPIS
    ===================================================== */

    const kpis:
      CFOResponse["kpis"] = {

      receita_total,

      custos_totais,

      resultado_operacional,

      margem_operacional_pct,

      saldo_caixa,

      divida_total,

      tendencia_3m,
    };

    /* =====================================================
       SCORE
    ===================================================== */

    const riscoScore =
      riscoOperacionalScore(
        receita_total,
        custos_totais,
        resultado_operacional,
        saldo_caixa,
        divida_total
      );

    /* =====================================================
       SINAIS
    ===================================================== */

    const sinais:
      SinalCFO[] = [];

    /* ==========================================
       CONTÁBIL
    ========================================== */

    if (
      resultado_operacional < 0
    ) {

      sinais.push({

        eixo: "contabil",

        tipo: "alerta",

        codigo:
          "resultado_negativo",

        severidade: "alta",

        prioridade: 1,

        mensagem:
          "Resultado operacional negativo detectado. Necessário revisar estrutura de custos imediatamente.",

        acao_sugerida:
          `Reduzir custos operacionais em 10%–20%. Potencial estimado: ${brlFormat(
            Math.max(
              0,
              custos_totais * 0.15
            )
          )}.`,
      });
    }

    if (
      margem_operacional_pct <= 5 &&
      receita_total > 0
    ) {

      sinais.push({

        eixo: "contabil",

        tipo: "alerta",

        codigo:
          "margem_critica",

        severidade: "media",

        prioridade: 2,

        mensagem:
          "Margem operacional extremamente baixa.",

        acao_sugerida:
          "Renegociar insumos, revisar despesas recorrentes e estabelecer teto operacional por hectare e por cabeça.",
      });
    }

    /* ==========================================
       OPERACIONAL
    ========================================== */

    if (
      custos_totais >
      receita_total
    ) {

      sinais.push({

        eixo: "operacional",

        tipo: "alerta",

        codigo:
          "custo_acima_receita",

        severidade: "alta",

        prioridade: 2,

        mensagem:
          "Custos operacionais acima da capacidade de geração de receita.",

        acao_sugerida:
          "Executar pente-fino em diesel, manutenção, energia, terceiros e compras recorrentes.",
      });
    }

    if (
      receita_total === 0 &&
      custos_totais > 0
    ) {

      sinais.push({

        eixo: "operacional",

        tipo: "alerta",

        codigo:
          "sem_receita",

        severidade: "alta",

        prioridade: 1,

        mensagem:
          "Custos presentes sem geração de receita.",

        acao_sugerida:
          "Conferir lançamentos e ativar plano emergencial de caixa.",
      });
    }

    /* ==========================================
       ESTRATÉGICO
    ========================================== */

    if (
      divida_total > 0 &&
      saldo_caixa <= 0
    ) {

      sinais.push({

        eixo: "estrategico",

        tipo: "alerta",

        codigo:
          "liquidez_critica",

        severidade: "media",

        prioridade: 3,

        mensagem:
          "Estrutura financeira apresenta risco de liquidez.",

        acao_sugerida:
          "Renegociar prazos e priorizar despesas críticas.",
      });
    }

    /* ==========================================
       INFO SAFE
    ========================================== */

    if (
      sinais.length === 0
    ) {

      sinais.push({

        eixo: "estrategico",

        tipo: "info",

        codigo:
          "runtime_estavel",

        severidade: "baixa",

        prioridade: 5,

        mensagem:
          "Nenhum alerta crítico detectado.",

        acao_sugerida:
          "Manter revisão semanal de KPIs financeiros.",
      });
    }

    /* =====================================================
       PLANO
    ===================================================== */

    const plano_acao =
      top3PlanoAcao(
        sinais,
        kpis
      );

    /* =====================================================
       RESUMO
    ===================================================== */

    const resumo_executivo =
      riscoScore >= 70
        ? "Financeiro em estado crítico. Prioridade máxima em redução de desperdícios, proteção de caixa e estabilização operacional."
        : riscoScore >= 40
        ? "Sistema em atenção operacional. Recomendável revisar despesas recorrentes e eficiência de conversão."
        : "Sistema financeiramente estável. Manter disciplina operacional e monitoramento contínuo.";

    /* =====================================================
       RESPONSE
    ===================================================== */

    return {

      ok: true,

      domain: "financeiro",

      ts: nowIso(),

      degraded: false,

      kpis,

      sinais,

      plano_acao,

      resumo_executivo,

      metadata: {

        runtime:
          "pecuariatech-cfo-ultra-runtime",

        analytics_ready: true,

        python_ready: true,
      },
    };

  } catch (err: any) {

    console.error(
      "[CFO][ENGINE] ERROR:",
      err
    );

    /* =====================================================
       DEGRADED MODE
    ===================================================== */

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

        saldo_caixa: 0,

        divida_total: 0,

        tendencia_3m:
          "misto",
      },

      sinais: [],

      plano_acao: [],

      resumo_executivo:
        "Modo seguro ativado. Runtime financeiro operando em contingência.",

      metadata: {

        runtime:
          "pecuariatech-cfo-ultra-runtime",

        analytics_ready: true,

        python_ready: true,
      },

      error:
        err?.message ||
        "internal_error",
    };
  }
}