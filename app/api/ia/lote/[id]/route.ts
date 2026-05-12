// app/api/ia/lote/[id]/route.ts
// PecuariaTech — IA UltraBiológica Premium
// Next.js 16 + App Router + TypeScript Strict
// Equação Y + Regra Z + Triângulo 360

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ======================================
// PLANOS COM ACESSO À IA
// ======================================

const PLANOS_PERMITIDOS = [
  "ultra",
  "dominus",
];

// ======================================
// PARÂMETROS TÉCNICOS
// ======================================

const PARAMETROS = {
  ganhoEsperadoKgDia: 0.75,
  limiteAtencao: 0.85,
  limiteCritico: 0.7,
  limiteDesuniformidade: 0.35,
};

// ======================================
// HANDLER
// ======================================

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ======================================
    // PARAMS NEXT 16
    // ======================================

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID do lote obrigatório",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // TOKEN
    // ======================================

    const authHeader =
      req.headers.get("authorization");

    const token = authHeader?.replace(
      "Bearer ",
      ""
    );

    if (!token) {
      return NextResponse.json(
        {
          error: "Não autenticado",
        },
        {
          status: 401,
        }
      );
    }

    // ======================================
    // CLIENTS
    // ======================================

    const supabaseUser = createClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const supabaseAdmin = createClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .SUPABASE_SERVICE_ROLE_KEY!
    );

    // ======================================
    // VALIDAR USUÁRIO
    // ======================================

    const {
      data: authData,
      error: authError,
    } =
      await supabaseUser.auth.getUser(
        token
      );

    if (authError || !authData?.user) {
      return NextResponse.json(
        {
          error:
            "Usuário inválido ou sessão expirada",
        },
        {
          status: 401,
        }
      );
    }

    const user = authData.user;

    // ======================================
    // VALIDAR ASSINATURA
    // ======================================

    const {
      data: assinatura,
      error: assinaturaError,
    } = await supabaseAdmin
      .from("assinaturas")
      .select("plano_codigo")
      .eq("user_id", user.id)
      .eq("status", "ativo")
      .maybeSingle();

    if (assinaturaError) {
      console.error(
        "Erro assinatura:",
        assinaturaError
      );

      return NextResponse.json(
        {
          error:
            "Erro ao validar assinatura",
        },
        {
          status: 500,
        }
      );
    }

    const plano =
      assinatura?.plano_codigo ??
      "trial";

    if (
      !PLANOS_PERMITIDOS.includes(
        plano
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Plano não possui acesso à IA UltraBiológica",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // BUSCAR ANIMAIS DO LOTE
    // ======================================

    const {
      data: animais,
      error: animaisError,
    } = await supabaseAdmin
      .from("animais")
      .select(`
        id,
        peso,
        ganho_medio_dia,
        custo_medio
      `)
      .eq("lote_id", id);

    if (
      animaisError ||
      !animais ||
      animais.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Lote não encontrado ou sem dados",
        },
        {
          status: 404,
        }
      );
    }

    // ======================================
    // MÉTRICAS
    // ======================================

    const totalAnimais =
      animais.length;

    const media = (
      campo:
        | "peso"
        | "ganho_medio_dia"
        | "custo_medio"
    ) =>
      animais.reduce(
        (acc, animal) =>
          acc +
          Number(
            animal[campo] || 0
          ),
        0
      ) / totalAnimais;

    const desvioPadrao = (
      campo:
        | "peso"
        | "ganho_medio_dia"
        | "custo_medio",
      mediaCampo: number
    ) =>
      Math.sqrt(
        animais.reduce(
          (acc, animal) =>
            acc +
            Math.pow(
              Number(
                animal[campo] || 0
              ) - mediaCampo,
              2
            ),
          0
        ) / totalAnimais
      );

    const pesoMedio =
      media("peso");

    const ganhoMedio =
      media("ganho_medio_dia");

    const custoMedio =
      media("custo_medio");

    const dpGanho =
      desvioPadrao(
        "ganho_medio_dia",
        ganhoMedio
      );

    const coefVariacao =
      ganhoMedio > 0
        ? dpGanho / ganhoMedio
        : 0;

    // ======================================
    // EFICIÊNCIA
    // ======================================

    const eficienciaEconomica =
      custoMedio > 0
        ? ganhoMedio / custoMedio
        : 0;

    // ======================================
    // STATUS
    // ======================================

    let status:
      | "adequado"
      | "atencao"
      | "critico" = "adequado";

    let alerta: string | null =
      null;

    if (
      ganhoMedio <
      PARAMETROS.ganhoEsperadoKgDia *
        PARAMETROS.limiteAtencao
    ) {
      status = "atencao";

      alerta =
        "Ganho médio abaixo do esperado para o sistema produtivo.";
    }

    if (
      ganhoMedio <
      PARAMETROS.ganhoEsperadoKgDia *
        PARAMETROS.limiteCritico
    ) {
      status = "critico";

      alerta =
        "Desempenho produtivo crítico com risco biológico e econômico.";
    }

    if (
      coefVariacao >
      PARAMETROS.limiteDesuniformidade
    ) {
      if (status !== "critico") {
        status = "atencao";
      }

      alerta =
        "Alta desuniformidade de desempenho detectada no lote.";
    }

    // ======================================
    // SCORE ULTRABIOLÓGICO
    // ======================================

    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (ganhoMedio /
            PARAMETROS.ganhoEsperadoKgDia) *
            100 -
            coefVariacao * 20
        )
      )
    );

    // ======================================
    // DIAGNÓSTICO
    // ======================================

    const diagnostico = `
Laudo técnico automatizado do lote ${id}.

Avaliação zootécnica:
O ganho médio diário observado foi de ${ganhoMedio.toFixed(
      2
    )} kg/dia frente ao valor de referência de ${PARAMETROS.ganhoEsperadoKgDia.toFixed(
      2
    )} kg/dia.

O peso médio atual do lote é de ${pesoMedio.toFixed(
      1
    )} kg.

Avaliação de uniformidade:
O coeficiente de variação do ganho foi de ${(
      coefVariacao * 100
    ).toFixed(1)}%.

Avaliação econômica:
O custo médio operacional foi estimado em R$ ${custoMedio.toFixed(
      2
    )} por animal, com eficiência produtiva de ${eficienciaEconomica.toFixed(
      3
    )} kg/R$.

Classificação técnica consolidada:
${status.toUpperCase()}.
`.trim();

    // ======================================
    // RECOMENDAÇÃO
    // ======================================

    const recomendacao =
      status === "adequado"
        ? "Manter o manejo atual e continuar monitoramento periódico dos indicadores produtivos."
        : status === "atencao"
        ? "Recomenda-se revisão nutricional, análise sanitária e monitoramento intensivo do lote."
        : "Intervenção técnica imediata recomendada com revisão nutricional, sanitária e ambiental.";

    // ======================================
    // RESPONSE
    // ======================================

    return NextResponse.json({
      lote_id: id,

      total_animais:
        totalAnimais,

      status,

      alerta,

      score_ultrabiologico:
        score,

      indicadores: {
        peso_medio:
          pesoMedio,

        ganho_medio_dia:
          ganhoMedio,

        custo_medio:
          custoMedio,

        coef_variacao_ganho:
          coefVariacao,

        eficiencia_kg_por_real:
          eficienciaEconomica,
      },

      diagnostico,

      recomendacao,
    });
  } catch (err) {
    console.error(
      "Erro IA UltraBiológica:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Erro interno na análise UltraBiológica",
      },
      {
        status: 500,
      }
    );
  }
}