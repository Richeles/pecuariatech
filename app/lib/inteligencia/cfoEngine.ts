// app/lib/inteligencia/cfoEngine.ts
// PecuariaTech — CFO Ultra Engine
// Triângulo 360 + Equação Y + Runtime Cognitivo

export type Eixo360 =
  | "contabil"
  | "operacional"
  | "estrategico";

export type Severidade =
  | "alta"
  | "media"
  | "baixa";

export type TipoSinal =
  | "alerta"
  | "info";

export type SinalCFO = {
  eixo: Eixo360;

  tipo: TipoSinal;

  codigo: string;

  severidade: Severidade;

  prioridade: 1 | 2 | 3 | 4 | 5;

  mensagem: string;

  acao_sugerida?: string;
};

export type KPIsFinanceiros = {
  receita_total: number;

  custos_totais: number;

  resultado_operacional: number;

  margem_operacional_pct: number;

  saldo_caixa?: number;

  divida_total?: number;

  tendencia_3m?: string;
};

/* =========================================================
   SCORE EXECUTIVO
========================================================= */

export function riskScore(
  kpis: KPIsFinanceiros
) {
  const receita =
    Number(kpis.receita_total || 0);

  const custos =
    Number(kpis.custos_totais || 0);

  const resultado =
    Number(
      kpis.resultado_operacional || 0
    );

  const margem =
    Number(
      kpis.margem_operacional_pct || 0
    );

  let score = 15;

  // =====================================
  // RECEITA ZERO
  // =====================================

  if (
    receita === 0 &&
    custos > 0
  ) {
    score += 40;
  }

  // =====================================
  // RESULTADO NEGATIVO
  // =====================================

  if (resultado < 0) {
    score += 30;
  }

  // =====================================
  // MARGEM CRÍTICA
  // =====================================

  if (
    margem <= 5 &&
    receita > 0
  ) {
    score += 15;
  }

  // =====================================
  // CUSTO MAIOR QUE RECEITA
  // =====================================

  if (
    custos > receita &&
    receita > 0
  ) {
    score += 15;
  }

  // =====================================
  // LIMITADOR
  // =====================================

  score = Math.max(
    0,
    Math.min(100, score)
  );

  return score;
}

/* =========================================================
   TONE SCORE
========================================================= */

export function scoreTone(
  score: number
) {
  if (score >= 70) {
    return "bg-red-600";
  }

  if (score >= 40) {
    return "bg-amber-500";
  }

  return "bg-emerald-600";
}

/* =========================================================
   BADGE STATUS
========================================================= */

export function badgeTone(
  degraded: boolean,
  sinais: SinalCFO[]
) {
  if (degraded) {
    return `
      bg-amber-100
      text-amber-800
      border-amber-200
    `;
  }

  const hasHigh =
    sinais.some(
      (x) =>
        x.severidade === "alta" &&
        x.tipo === "alerta"
    );

  if (hasHigh) {
    return `
      bg-red-100
      text-red-800
      border-red-200
    `;
  }

  const hasMed =
    sinais.some(
      (x) =>
        x.severidade === "media" &&
        x.tipo === "alerta"
    );

  if (hasMed) {
    return `
      bg-amber-100
      text-amber-800
      border-amber-200
    `;
  }

  return `
    bg-emerald-100
    text-emerald-800
    border-emerald-200
  `;
}

/* =========================================================
   STATUS EXECUTIVO
========================================================= */

export function statusText(
  degraded: boolean,
  sinais: SinalCFO[]
) {
  if (degraded) {
    return "Modo seguro";
  }

  const hasHigh =
    sinais.some(
      (x) =>
        x.severidade === "alta" &&
        x.tipo === "alerta"
    );

  if (hasHigh) {
    return "Alerta alto";
  }

  const hasMed =
    sinais.some(
      (x) =>
        x.severidade === "media" &&
        x.tipo === "alerta"
    );

  if (hasMed) {
    return "Atenção";
  }

  return "Estável";
}

/* =========================================================
   FORMATADORES
========================================================= */

export function brl(
  valor: number
) {
  try {
    return (
      valor || 0
    ).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  } catch {
    return `R$ ${valor ?? 0}`;
  }
}

export function pct(
  valor: number
) {
  const x =
    Number(valor || 0);

  return `${x.toFixed(2)}%`;
}

/* =========================================================
   LABELS
========================================================= */

export function eixoLabel(
  eixo: Eixo360
) {
  if (eixo === "contabil") {
    return "Contábil";
  }

  if (eixo === "operacional") {
    return "Operacional";
  }

  return "Estratégico";
}

/* =========================================================
   SEVERIDADE VISUAL
========================================================= */

export function severidadeTone(
  severidade: Severidade
) {
  if (severidade === "alta") {
    return `
      bg-red-50
      border-red-200
      text-red-700
    `;
  }

  if (severidade === "media") {
    return `
      bg-amber-50
      border-amber-200
      text-amber-700
    `;
  }

  return `
    bg-emerald-50
    border-emerald-200
    text-emerald-700
  `;
}