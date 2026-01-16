// app/lib/inteligencia/engine.ts
// Núcleo de Inteligência Operacional — PecuariaTech Autônomo
// Padrão: módulos (CFO/VET/AGR/ZOOT) retornam sinais operacionais auditáveis
// Sem IA genérica: foco em decisão prática, explicável e rastreável.

export type Severity = "info" | "warning" | "critical";
export type Domain = "financeiro" | "rebanho" | "pastagem" | "engorda";

export type Signal = {
  id: string;
  domain: Domain;
  severity: Severity;

  titulo: string;
  descricao: string;

  // “O que fazer agora”
  acao_recomendada?: string;

  // Métrica central do sinal
  metric?: {
    nome: string;
    valor: number | string;
    unidade?: string;
    ref?: string;
  };

  // Risco/Confiança (Triângulo 360 + Motor π)
  risco_score?: number; // 0..100
  confianca_score?: number; // 0..100

  // Rastreamento: qual view/coluna origina este sinal
  origem?: {
    view: string;
    campos?: string[];
  };
};

export type IntelligenceResponse = {
  ok: true;
  domain: Domain;
  ts: string;

  // Indicadores agregados do módulo
  kpis: Record<string, number | string | null>;

  // Sinais operacionais (alertas, oportunidades, riscos)
  sinais: Signal[];

  // Recomendação curta do especialista do módulo
  resumo_executivo: string;
};

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function mkSignal(partial: Omit<Signal, "id">): Signal {
  const id = `${partial.domain}-${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}`;
  return { id, ...partial };
}
