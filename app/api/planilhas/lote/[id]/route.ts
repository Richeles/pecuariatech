// app/api/planilhas/lote/[id]/route.ts
// PecuariaTech — Exportação CSV Premium por Lote
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

    const { id: loteId } =
      await params;

    if (!loteId) {
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
            "Plano não permite exportação por lote",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // BUSCAR ANIMAIS
    // ======================================

    const {
      data: animais,
      error: animaisError,
    } = await supabaseAdmin
      .from("animais")
      .select(`
        id,
        nome,
        brinco,
        peso,
        ganho_medio_dia,
        custo_medio,
        status
      `)
      .eq("lote_id", loteId);

    if (
      animaisError ||
      !animais ||
      animais.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Lote não encontrado ou vazio",
        },
        {
          status: 404,
        }
      );
    }

    // ======================================
    // MÉTRICAS EXECUTIVAS
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

    const pesoMedio =
      media("peso");

    const ganhoMedio =
      media("ganho_medio_dia");

    const custoMedio =
      media("custo_medio");

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

    const linhas = [
      "Campo;Valor",

      `Sistema;PecuariaTech`,
      `Versao;Enterprise`,
      `Lote;${loteId}`,
      `Exportado Em;${new Date().toISOString()}`,

      "",

      `Total Animais;${totalAnimais}`,
      `Peso Médio;${pesoMedio.toFixed(
        2
      )}`,

      `Ganho Médio Diário;${ganhoMedio.toFixed(
        3
      )}`,

      `Custo Médio;${custoMedio.toFixed(
        2
      )}`,

      `Eficiência Kg/R$;${eficiencia.toFixed(
        4
      )}`,

      `Score UltraBiológico;${score}`,

      "",

      "Animais do lote:",
      "",

      "ID;Nome;Brinco;Peso;Ganho Médio;Custo Médio;Status",
    ];

    animais.forEach((animal) => {
      linhas.push(
        [
          animal.id,
          animal.nome ?? "",
          animal.brinco ?? "",
          animal.peso ?? "",
          animal.ganho_medio_dia ?? "",
          animal.custo_medio ?? "",
          animal.status ?? "",
        ].join(";")
      );
    });

    const csv = linhas.join("\n");

    // ======================================
    // RESPONSE
    // ======================================

    return new NextResponse(csv, {
      status: 200,

      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          `attachment; filename="lote_${loteId}.csv"`,

        "Cache-Control":
          "no-store",
      },
    });
  } catch (err) {
    console.error(
      "Erro exportação lote:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Erro interno na exportação do lote",
      },
      {
        status: 500,
      }
    );
  }
}