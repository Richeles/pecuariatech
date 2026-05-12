// app/api/planilhas/animal/[id]/route.ts
// PecuariaTech — Exportação CSV Premium por Animal
// Next.js 16 + App Router + TypeScript Strict
// Equação Y + Regra Z + Triângulo 360

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ======================================
// PLANOS COM EXPORTAÇÃO
// ======================================

const PLANOS_PERMITIDOS = [
  "ultra",
  "dominus",
];

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

    const { id: animalId } =
      await params;

    if (!animalId) {
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

    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

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
            "Plano não permite exportação por animal",
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
        brinco,
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
      .eq("id", animalId)
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
    // MÉTRICAS EXECUTIVAS
    // ======================================

    const pesoAtual = Number(
      animal.peso || 0
    );

    const ganhoMedio = Number(
      animal.ganho_medio_dia || 0
    );

    const custoMedio = Number(
      animal.custo_medio || 0
    );

    const score =
      ganhoMedio > 0
        ? Math.min(
            100,
            Math.round(
              (ganhoMedio / 0.75) *
                100
            )
          )
        : 0;

    const eficiencia =
      custoMedio > 0
        ? ganhoMedio / custoMedio
        : 0;

    // ======================================
    // CSV PREMIUM
    // ======================================

    const csv = [
      "Campo;Valor",

      `Sistema;PecuariaTech`,
      `Versao;Enterprise`,
      `Exportado Em;${new Date().toISOString()}`,

      "",

      `ID;${animal.id}`,
      `Nome;${animal.nome ?? ""}`,
      `Brinco;${animal.brinco ?? ""}`,
      `Raça;${animal.raca ?? ""}`,
      `Sexo;${animal.sexo ?? ""}`,
      `Categoria;${animal.categoria ?? ""}`,

      "",

      `Peso Atual;${pesoAtual}`,
      `Peso Inicial;${
        animal.peso_inicial ?? ""
      }`,
      `Ganho Médio Diário;${ganhoMedio}`,
      `Custo Médio;${custoMedio}`,
      `Status;${animal.status ?? ""}`,

      "",

      `Score UltraBiológico;${score}`,
      `Eficiência Kg/R$;${eficiencia.toFixed(
        4
      )}`,

      "",

      `Data Nascimento;${
        animal.data_nascimento ?? ""
      }`,

      `Criado Em;${
        animal.criado_em ?? ""
      }`,
    ].join("\n");

    // ======================================
    // RESPONSE
    // ======================================

    return new NextResponse(csv, {
      status: 200,

      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          `attachment; filename="animal_${animal.id}.csv"`,

        "Cache-Control":
          "no-store",
      },
    });
  } catch (err) {
    console.error(
      "Erro exportação animal:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Erro interno na exportação inteligente",
      },
      {
        status: 500,
      }
    );
  }
}