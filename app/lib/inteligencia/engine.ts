// app/lib/inteligencia/engine.ts
// CFO EXECUTIVO REAL — Motor Cognitivo Financeiro
// Equação X + Equação Y + Regra Z + Triângulo 360
// Runtime Cognitivo Premium Internacional
//
// Regras:
// ✔ engine NÃO acessa Supabase diretamente
// ✔ engine NÃO usa fetch interno
// ✔ engine NÃO usa localhost
// ✔ engine usa service layer
// ✔ degraded mode obrigatório
// ✔ runtime resiliente
// ✔ tipagem financeira estabilizada

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

/* =====================================================
   SNAPSHOT CANÔNICO
===================================================== */

type FinanceiroSnapshot = {

  receita_total: number;

  receita_operacional?: number;

  receita_outros?: number;

  custos_totais: number;

  custos_fixos?: number;

  custos_variaveis?: number;

  resultado_operacional: number;

  margem_operacional_pct: number;

  lucro_estimado?: number;

  margem_liquida?: number;

  saldo_caixa: number;

  divida_total: number;

  tendencia_3m?: string;

  total_animais?: number;

  lotes_ativos?: number;

  peso_medio?: number;

  periodo?: string;

  updated_at?: string;
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

    saldo_caixa: number;

    divida_total: number;

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

function n(v: unknown): number {

  const x =
    Number(v);

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
   SCORE
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
   PLANO DE AÇÃO
===================================================== */

function top3PlanoAcao(
  sinais: SinalCFO[],
  kpis: CFOResponse["kpis"]
) {

  const ranked =
    [...sinais].sort(
      (a, b) => {

        const sev =
          (x: string) =>

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
    CFOResponse["plano_acao"] = [];

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

        : s.eixo === "operacional"

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

    /* ==========================================
       SNAPSHOT
    ========================================== */

    const rawSnapshot =
      await getFinanceiroSnapshot();

    /* ==========================================
       TRIÂNGULO 360
       EQUAÇÃO X + Y + REGRA Z
    ========================================== */

    const snapshot =
      rawSnapshot as unknown as FinanceiroSnapshot;

    /* ==========================================
       EXTRAÇÃO
    ========================================== */

    const {

      receita_total,

      custos_totais,

      resultado_operacional,

      margem_operacional_pct,

      saldo_caixa,

      divida_total,

      tendencia_3m,

    } = snapshot;

    /* ==========================================
       KPIS
    ========================================== */

    const kpis:
      CFOResponse["kpis"] = {

      receita_total:
        n(receita_total),

      custos_totais:
        n(custos_totais),

      resultado_operacional:
        n(resultado_operacional),

      margem_operacional_pct:
        n(margem_operacional_pct),

      saldo_caixa:
        n(saldo_caixa),

      divida_total:
        n(divida_total),

      tendencia_3m,
    };

    /* ==========================================
       SCORE
    ========================================== */

    const riscoScore =
      riscoOperacionalScore(

        kpis.receita_total,

        kpis.custos_totais,

        kpis.resultado_operacional,

        kpis.saldo_caixa,

        kpis.divida_total
      );

    /* ==========================================
       SINAIS
    ========================================== */

    const sinais:
      SinalCFO[] = [];

    /* ==========================================
       CONTÁBIL
    ========================================== */

    if (
      kpis.resultado_operacional < 0
    ) {

      sinais.push({

        eixo: "contabil",

        tipo: "alerta",

        codigo:
          "resultado_negativo",

        severidade: "alta",

        prioridade: 1,

        mensagem:
          "Resultado operacional negativo detectado.",

        acao_sugerida:
          `Reduzir custos operacionais em 10%–20%. Potencial estimado: ${brlFormat(
            Math.max(
              0,
              kpis.custos_totais * 0.15
            )
          )}.`,
      });
    }

    if (
      kpis.margem_operacional_pct <= 5 &&
      kpis.receita_total > 0
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
          "Renegociar insumos e revisar despesas recorrentes.",
      });
    }

    /* ==========================================
       OPERACIONAL
    ========================================== */

    if (
      kpis.custos_totais >
      kpis.receita_total
    ) {

      sinais.push({

        eixo: "operacional",

        tipo: "alerta",

        codigo:
          "custo_acima_receita",

        severidade: "alta",

        prioridade: 2,

        mensagem:
          "Custos acima da receita operacional.",

        acao_sugerida:
          "Executar pente-fino operacional.",
      });
    }

    if (
      kpis.receita_total === 0 &&
      kpis.custos_totais > 0
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
          "Conferir lançamentos financeiros.",
      });
    }

    /* ==========================================
       ESTRATÉGICO
    ========================================== */

    if (
      kpis.divida_total > 0 &&
      kpis.saldo_caixa <= 0
    ) {

      sinais.push({

        eixo: "estrategico",

        tipo: "alerta",

        codigo:
          "liquidez_critica",

        severidade: "media",

        prioridade: 3,

        mensagem:
          "Risco de liquidez detectado.",

        acao_sugerida:
          "Renegociar prazos financeiros.",
      });
    }

    /* ==========================================
       SAFE MODE
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
          "Manter revisão semanal de KPIs.",
      });
    }

    /* ==========================================
       PLANO
    ========================================== */

    const plano_acao =
      top3PlanoAcao(
        sinais,
        kpis
      );

    /* ==========================================
       RESUMO
    ========================================== */

    const resumo_executivo =

      riscoScore >= 70

        ? "Financeiro em estado crítico."

        : riscoScore >= 40

        ? "Sistema em atenção operacional."

        : "Sistema financeiramente estável.";

    /* ==========================================
       RESPONSE
    ========================================== */

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
        "Modo seguro ativado.",

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