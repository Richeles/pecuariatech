// app/api/ia/lote/[id]/route.ts
// Next.js 16 + TypeScript strict
// IA UltraBiológica Autônoma — Orientação Veterinária & Zootécnica

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Planos habilitados para IA
const PLANOS_PERMITIDOS = ["ultra", "dominus"];

// Parâmetros técnicos globais (futuro: tabela/config)
const PARAMETROS = {
  ganhoEsperadoKgDia: 0.75, // referência média sistema intensivo
  limiteAtencao: 0.85,
  limiteCritico: 0.7,
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loteId = params.id;
    if (!loteId) {
      return NextResponse.json({ error: "ID do lote obrigatório" }, { status: 400 });
    }

    // ===============================
    // AUTENTICAÇÃO
    // ===============================
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await supabaseUser.auth.getUser(token);
    const user = userData?.user;
    if (!user) {
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });
    }

    // ===============================
    // VERIFICAR PLANO
    // ===============================
    const { data: assinatura } = await supabaseAdmin
      .from("assinaturas")
      .select("plano_codigo")
      .eq("user_id", user.id)
      .eq("status", "ativo")
      .maybeSingle();

    const plano = assinatura?.plano_codigo ?? "trial";
    if (!PLANOS_PERMITIDOS.includes(plano)) {
      return NextResponse.json({ error: "Plano não permite IA" }, { status: 403 });
    }

    // ===============================
    // BUSCAR DADOS DO LOTE
    // ===============================
    const { data: animais } = await supabaseAdmin
      .from("animais")
      .select("peso, ganho_medio_dia, custo_medio")
      .eq("lote_id", loteId);

    if (!animais || animais.length === 0) {
      return NextResponse.json({ error: "Lote sem dados" }, { status: 404 });
    }

    // ===============================
    // MÉTRICAS BÁSICAS
    // ===============================
    const total = animais.length;

    const media = (campo: keyof typeof animais[0]) =>
      animais.reduce((s, a) => s + Number(a[campo] || 0), 0) / total;

    const desvioPadrao = (campo: keyof typeof animais[0], mediaCampo: number) =>
      Math.sqrt(
        animais.reduce(
          (s, a) => s + Math.pow(Number(a[campo] || 0) - mediaCampo, 2),
          0
        ) / total
      );

    const pesoMedio = media("peso");
    const ganhoMedio = media("ganho_medio_dia");
    const custoMedio = media("custo_medio");

    const dpGanho = desvioPadrao("ganho_medio_dia", ganhoMedio);
    const coefVariacao = ganhoMedio > 0 ? dpGanho / ganhoMedio : 0;

    // ===============================
    // AVALIAÇÃO BIOLÓGICA & ECONÔMICA
    // ===============================
    const ganhoEsperado = PARAMETROS.ganhoEsperadoKgDia;
    const eficienciaEconomica =
      custoMedio > 0 ? ganhoMedio / custoMedio : 0;

    let status: "adequado" | "atencao" | "critico" = "adequado";
    let alerta: string | null = null;

    if (ganhoMedio < ganhoEsperado * PARAMETROS.limiteAtencao) {
      status = "atencao";
      alerta = "Ganho médio diário abaixo do esperado para o sistema produtivo.";
    }

    if (ganhoMedio < ganhoEsperado * PARAMETROS.limiteCritico) {
      status = "critico";
      alerta =
        "Desempenho produtivo crítico, indicando risco biológico e econômico elevado.";
    }

    if (coefVariacao > 0.35) {
      status = status === "critico" ? "critico" : "atencao";
      alerta =
        "Alta variabilidade de desempenho entre animais do lote, sugerindo desuniformidade.";
    }

    // ===============================
    // SCORE ULTRABIOLÓGICO (0–100)
    // ===============================
    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (ganhoMedio / ganhoEsperado) * 100 -
            coefVariacao * 20
        )
      )
    );

    // ===============================
    // LAUDO TÉCNICO (VET + ZOOT)
    // ===============================
    const diagnostico = `
Laudo técnico automatizado do lote (${total} animais).

Avaliação zootécnica:
O ganho médio diário observado foi de ${ganhoMedio.toFixed(
      2
    )} kg/dia, frente ao valor de referência de ${ganhoEsperado.toFixed(
      2
    )} kg/dia. O peso médio atual do lote é de ${pesoMedio.toFixed(1)} kg.

Avaliação de uniformidade:
O coeficiente de variação do ganho diário foi de ${(coefVariacao * 100).toFixed(
      1
    )}%, indicando ${
      coefVariacao > 0.35
        ? "desuniformidade relevante entre os animais"
        : "boa homogeneidade do lote"
    }.

Avaliação econômica:
O custo médio estimado é de R$ ${custoMedio.toFixed(
      2
    )} por animal, com eficiência biológica de ${eficienciaEconomica.toFixed(
      3
    )} kg/R$.

Classificação técnica do lote: ${status.toUpperCase()}.
`.trim();

    const recomendacao =
      status === "adequado"
        ? "Manter o manejo nutricional e sanitário atual, com acompanhamento periódico dos indicadores."
        : status === "atencao"
        ? "Recomenda-se revisar a dieta, verificar consumo, avaliar sanidade e reduzir possíveis fatores de estresse."
        : "Intervenção técnica imediata indicada: revisão da formulação da dieta, protocolo sanitário, manejo e ambiente.";

    return NextResponse.json({
      lote_id: loteId,
      total_animais: total,
      status,
      alerta,
      score_ultrabiologico: score,
      indicadores: {
        peso_medio: pesoMedio,
        ganho_medio_dia: ganhoMedio,
        custo_medio: custoMedio,
        coef_variacao_ganho: coefVariacao,
        eficiencia_kg_por_real: eficienciaEconomica,
      },
      diagnostico,
      recomendacao,
    });
  } catch (err) {
    console.error("Erro IA UltraBiológica:", err);
    return NextResponse.json(
      { error: "Erro na análise UltraBiológica" },
      { status: 500 }
    );
  }
}
