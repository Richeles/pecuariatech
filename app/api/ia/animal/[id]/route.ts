// app/api/ia/animal/[id]/route.ts
// PecuariaTech — IA UltraBiológica Individual
// Next.js 16 App Router + TypeScript Strict
// Equação Y + Regra Z + Triângulo 360
// API Read-Only • SSR Safe • Enterprise Stable

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ======================================
// PLANOS COM ACESSO À IA INDIVIDUAL
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
  limiteCritico: 0.65,
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
            "ID do animal obrigatório",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // AUTHORIZATION
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
    // VERIFICAR ASSINATURA
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
            "Plano não possui acesso à IA individual",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // BUSCAR ANIMAL
    // ======================================

    const {
      data: animal,
      error: animalError,
    } = await supabaseAdmin
      .from("animais")
      .select(`
        id,
        nome,
        raca,
        sexo,
        categoria,
        peso,
        peso_inicial,
        ganho_medio_dia,
        custo_medio,
        status,
        data_nascimento,
        criado_em
      `)
      .eq("id", id)
      .single();

    if (animalError || !animal) {
      return NextResponse.json(
        {
          error:
            "Animal não encontrado",
        },
        {
          status: 404,
        }
      );
    }

    // ======================================
    // NORMALIZAÇÃO
    // ======================================

    const ganhoEsperado =
      PARAMETROS.ganhoEsperadoKgDia;

    const ganho = Number(
      animal.ganho_medio_dia || 0
    );

    const custo = Number(
      animal.custo_medio || 0
    );

    const peso = Number(
      animal.peso || 0
    );

    // ======================================
    // CLASSIFICAÇÃO
    // ======================================

    let status:
      | "adequado"
      | "atencao"
      | "critico" = "adequado";

    let alerta: string | null =
      null;

    if (
      ganho <
      ganhoEsperado *
        PARAMETROS.limiteAtencao
    ) {
      status = "atencao";

      alerta =
        "Ganho médio abaixo do esperado para o perfil produtivo.";
    }

    if (
      ganho <
      ganhoEsperado *
        PARAMETROS.limiteCritico
    ) {
      status = "critico";

      alerta =
        "Desempenho produtivo crítico com risco biológico e econômico.";
    }

    // ======================================
    // EFICIÊNCIA
    // ======================================

    const eficiencia =
      custo > 0
        ? ganho / custo
        : 0;

    // ======================================
    // SCORE ULTRABIOLÓGICO
    // ======================================

    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (ganho /
            ganhoEsperado) *
            100
        )
      )
    );

    // ======================================
    // DIAGNÓSTICO
    // ======================================

    const diagnostico = `
Laudo técnico individual do animal ${
      animal.nome ?? animal.id
    }.

Avaliação zootécnica:
O ganho médio diário observado foi de ${ganho.toFixed(
      2
    )} kg/dia, frente ao valor de referência de ${ganhoEsperado.toFixed(
      2
    )} kg/dia.

O peso atual registrado é de ${peso.toFixed(
      1
    )} kg.

Avaliação econômica:
O custo médio operacional estimado é de R$ ${custo.toFixed(
      2
    )}, com eficiência produtiva de ${eficiencia.toFixed(
      3
    )} kg/R$.

Avaliação veterinária:
Desvios persistentes podem indicar fatores nutricionais, sanitários ou ambientais.

Classificação técnica individual: ${status.toUpperCase()}.
`.trim();

    // ======================================
    // RECOMENDAÇÃO
    // ======================================

    const recomendacao =
      status === "adequado"
        ? "Manter o manejo atual e monitorar o desempenho periodicamente."
        : status === "atencao"
        ? "Revisar manejo nutricional e monitorar evolução zootécnica."
        : "Recomenda-se intervenção técnica imediata com avaliação sanitária e nutricional.";

    // ======================================
    // RESPONSE
    // ======================================

    return NextResponse.json({
      animal_id: animal.id,

      nome: animal.nome,

      status,

      alerta,

      score_ultrabiologico:
        score,

      indicadores: {
        peso,

        ganho_medio_dia:
          ganho,

        custo_medio: custo,

        eficiencia_kg_por_real:
          eficiencia,
      },

      diagnostico,

      recomendacao,
    });
  } catch (err) {
    console.error(
      "Erro IA animal:",
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