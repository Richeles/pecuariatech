import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthenticatedClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: error ? null : user,
  };
}

// =====================================================
// GET /api/rebanho
// Lista os animais do usuário autenticado
// =====================================================
export async function GET() {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Usuário não autenticado",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("animais")
      .select(
        `
        id,
        brinco,
        lote,
        sexo,
        raca,
        peso_entrada,
        peso_atual,
        gmd,
        data_vacina,
        piquete_atual,
        criado_em
        `
      )
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro Supabase listar animais:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    const rows = (data || []).map((item) => {
      let sexoNormalizado = item.sexo || "—";

      if (sexoNormalizado === "M") {
        sexoNormalizado = "Macho";
      } else if (sexoNormalizado === "F") {
        sexoNormalizado = "Fêmea";
      }

      return {
        animal_id: item.id,
        animal_brinco: item.brinco || "—",
        raca: item.raca || "—",
        sexo: sexoNormalizado,
        peso: item.peso_atual ?? item.peso_entrada ?? null,
        status_biologico: "Ativo",
        movimentacao_local:
          item.piquete_atual || item.lote || "—",
      };
    });

    return NextResponse.json({
      ok: true,
      message: "Operação concluída",
      data: rows,
      rows,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Erro inesperado ao listar rebanho:", err);

    return NextResponse.json(
      {
        ok: false,
        error: "Erro interno ao listar rebanho",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/rebanho
// Cadastra animal no tenant autenticado
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Usuário não autenticado",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const brinco =
      body.brinco ??
      body.brinco_id ??
      null;

    if (!brinco) {
      return NextResponse.json(
        {
          ok: false,
          error: "Brinco é obrigatório",
        },
        { status: 400 }
      );
    }

    const pesoInicial = Number(body.peso_inicial);

    if (!Number.isFinite(pesoInicial)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Peso inicial inválido",
        },
        { status: 400 }
      );
    }

    // Somente colunas existentes na entidade canônica "animais".
    // user_id vem exclusivamente da sessão autenticada.
    const payload = {
      user_id: user.id,
      brinco,
      lote: body.lote || null,
      sexo: body.sexo || null,
      raca: body.raca || null,
      peso_entrada: pesoInicial,
    };

    const { data, error } = await supabase
      .from("animais")
      .insert([payload])
      .select(
        `
        id,
        user_id,
        brinco,
        lote,
        sexo,
        raca,
        peso_entrada,
        peso_atual,
        gmd,
        data_vacina,
        piquete_atual,
        criado_em
        `
      )
      .single();

    if (error) {
      console.error("Erro Supabase cadastrar animal:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Animal cadastrado com sucesso",
        data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erro inesperado ao cadastrar animal:", err);

    return NextResponse.json(
      {
        ok: false,
        error: "Erro interno ao cadastrar animal",
      },
      { status: 500 }
    );
  }
}
