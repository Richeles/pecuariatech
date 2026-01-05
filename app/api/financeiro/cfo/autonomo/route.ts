// CAMINHO: app/api/financeiro/cfo/autonomo/route.ts
// CFO Autônomo Ultra — Motor Financeiro Inteligente
// Next.js 16 + TypeScript strict

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type DecisaoCFO = {
  titulo: string;
  mensagem: string;
  prioridade: "baixa" | "media" | "alta";
  impacto_estimado: string;
  acao_recomendada: string;
};

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ===============================
  // BASE FINANCEIRA REAL
  // ===============================
  const { data, error } = await supabase
    .from("financeiro_indicadores_view")
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ status: "sem_dados" }, { status: 200 });
  }

  const {
    receita,
    custos,
    ebitda,
    margem_percentual,
    tendencia,
    baseline_receita,
    baseline_custos,
    baseline_ebitda,
  } = data;

  // ===============================
  // MOTOR ULTRAINTELIGENTE
  // ===============================
  let prioridade: DecisaoCFO["prioridade"] = "baixa";
  let titulo = "Operação financeiramente estável";
  let mensagem =
    "Os indicadores financeiros estão dentro do padrão esperado para sua operação.";
  let impacto_estimado = "Estável";
  let acao_recomendada = "Manter estratégia atual e monitorar.";

  // 🔴 ALERTA CRÍTICO — EBITDA
  if (ebitda < baseline_ebitda * 0.85) {
    prioridade = "alta";
    titulo = "Queda crítica no EBITDA";
    mensagem =
      "O EBITDA atual caiu significativamente em relação ao histórico. Há risco direto de redução de caixa.";
    impacto_estimado = "Alto impacto negativo no fluxo de caixa";
    acao_recomendada =
      "Revisar custos variáveis, renegociar insumos e reavaliar lotes de menor desempenho.";
  }

  // 🟠 ALERTA MÉDIO — CUSTOS
  else if (custos > baseline_custos * 1.15) {
    prioridade = "media";
    titulo = "Custos acima do padrão";
    mensagem =
      "Os custos operacionais estão acima do histórico esperado para este período.";
    impacto_estimado = "Redução gradual da margem";
    acao_recomendada =
      "Analisar despesas recentes, consumo de insumos e eficiência por lote.";
  }

  // 🟢 EVOLUÇÃO POSITIVA
  else if (tendencia === "alta") {
    prioridade = "baixa";
    titulo = "Evolução financeira positiva";
    mensagem =
      "A operação apresenta crescimento consistente em relação ao histórico.";
    impacto_estimado = "Melhoria contínua da rentabilidade";
    acao_recomendada =
      "Avaliar reinvestimento estratégico e ampliação controlada da produção.";
  }

  // ===============================
  // RESPOSTA FINAL DO CFO
  // ===============================
  return NextResponse.json({
    titulo,
    mensagem,
    prioridade,
    impacto_estimado,
    acao_recomendada,
    gerado_em: new Date().toISOString(),
  });
}
