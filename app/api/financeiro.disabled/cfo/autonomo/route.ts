// CAMINHO: app/api/financeiro/cfo/autonomo/route.ts
// UltraCFO Autônomo — Motor Financeiro Inteligente
// Next.js 16 + TypeScript strict
// SERVER ONLY

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Prioridade = "baixa" | "media" | "alta";

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ===============================
  // 1) BASE FINANCEIRA REAL (VIEW)
  // ===============================
  const { data, error } = await supabase
    .from("financeiro_indicadores_view")
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { status: "sem_dados" },
      { status: 200 }
    );
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
  // 2) MOTOR DE DECISÃO ULTRACFO
  // ===============================
  let prioridade: Prioridade = "baixa";
  let titulo = "Operação financeiramente estável";
  let mensagem =
    "Os indicadores financeiros estão dentro do padrão esperado para sua operação.";
  let impacto_estimado = "Estável";
  let acao_recomendada =
    "Manter estratégia atual e monitorar indicadores.";

  let plano_recomendado:
    | "basico"
    | "profissional"
    | "ultra"
    | "empresarial"
    | "premium_dominus" = "profissional";

  // 🔴 ALERTA CRÍTICO — EBITDA
  if (ebitda < baseline_ebitda * 0.85) {
    prioridade = "alta";
    titulo = "Queda crítica no EBITDA";
    mensagem =
      "O EBITDA atual caiu significativamente em relação ao histórico. Há risco direto de pressão no caixa.";
    impacto_estimado = "Alto impacto negativo no fluxo de caixa";
    acao_recomendada =
      "Revisar custos variáveis, renegociar insumos e reavaliar lotes de menor desempenho.";
    plano_recomendado = "profissional";
  }

  // 🟠 ALERTA MÉDIO — CUSTOS
  else if (custos > baseline_custos * 1.15) {
    prioridade = "media";
    titulo = "Custos acima do padrão histórico";
    mensagem =
      "Os custos operacionais estão acima do esperado para este período.";
    impacto_estimado = "Redução gradual da margem";
    acao_recomendada =
      "Analisar despesas recentes, consumo de insumos e eficiência por lote.";
    plano_recomendado = "ultra";
  }

  // 🟢 EVOLUÇÃO POSITIVA
  else if (tendencia === "alta" && margem_percentual >= 15) {
    prioridade = "baixa";
    titulo = "Evolução financeira positiva";
    mensagem =
      "A operação apresenta crescimento consistente e margem saudável.";
    impacto_estimado = "Melhoria contínua da rentabilidade";
    acao_recomendada =
      "Avaliar reinvestimento estratégico e ampliação controlada da produção.";
    plano_recomendado = "ultra";
  }

  // 🟣 OPERAÇÃO DE NÍVEL EMPRESARIAL
  if (receita >= 100000 && margem_percentual >= 20) {
    plano_recomendado = "empresarial";
  }

  if (receita >= 200000 && ebitda > 0) {
    plano_recomendado = "premium_dominus";
  }

  // ===============================
  // 3) RESPOSTA FINAL DO ULTRACFO
  // ===============================
  return NextResponse.json({
    titulo,
    mensagem,
    prioridade,
    impacto_estimado,
    acao_recomendada,
    plano_recomendado,
    indicadores: {
      receita,
      custos,
      ebitda,
      margem_percentual,
      tendencia,
    },
    gerado_em: new Date().toISOString(),
  });
}
