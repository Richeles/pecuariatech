// CAMINHO: app/api/planos/recomendacao/route.ts
// IA Recomendadora de Plano — PecuariaTech
// Next.js 16 | Server-only

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RecomendacaoPlano = {
  plano: "basico" | "profissional" | "ultra" | "empresarial" | "premium_dominus";
  motivo: string;
};

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ===============================
  // DADOS REAIS DA OPERAÇÃO
  // ===============================
  const { data, error } = await supabase
    .from("financeiro_indicadores_view")
    .select(
      `
      receita,
      custos,
      ebitda,
      margem_percentual
    `
    )
    .single();

  // Fallback seguro
  if (error || !data) {
    return NextResponse.json<RecomendacaoPlano>({
      plano: "basico",
      motivo:
        "Comece pelo Básico para estruturar sua fazenda e gerar histórico.",
    });
  }

  const { receita, ebitda, margem_percentual } = data;

  // ===============================
  // MOTOR DE DECISÃO (IA EXPLICÁVEL)
  // ===============================
  if (receita < 50000) {
    return NextResponse.json<RecomendacaoPlano>({
      plano: "basico",
      motivo:
        "Sua operação ainda está em fase inicial. O Básico organiza e cria base sólida.",
    });
  }

  if (receita >= 50000 && receita < 200000) {
    return NextResponse.json<RecomendacaoPlano>({
      plano: "profissional",
      motivo:
        "Você já movimenta valores relevantes e precisa entender melhor seus números.",
    });
  }

  if (ebitda > 0 && margem_percentual >= 15) {
    return NextResponse.json<RecomendacaoPlano>({
      plano: "ultra",
      motivo:
        "Sua operação já gera resultado. O plano Ultra ajuda a decidir melhor e crescer.",
    });
  }

  if (receita >= 500000) {
    return NextResponse.json<RecomendacaoPlano>({
      plano: "empresarial",
      motivo:
        "Sua operação exige controle, padronização e escala.",
    });
  }

  return NextResponse.json<RecomendacaoPlano>({
    plano: "premium_dominus",
    motivo:
      "Perfil estratégico identificado. O Dominus entrega visão completa de gestão e investimento.",
  });
}
