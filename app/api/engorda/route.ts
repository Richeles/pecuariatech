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

  if (error || !user) {
    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

// GET – Listar lotes
export async function GET(req: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("engorda")
      .select("*")
      .eq("user_id", user.id)
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error("[Engorda API] Erro:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      rows: data,
      ok: true,
    });
  } catch (error) {
    console.error("[Engorda API] Erro interno:", error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}

// POST – Cadastrar lote
export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // user_id enviado pelo cliente NÃO é autoridade.
    // A identidade persistida vem exclusivamente da sessão.
    const payload = {
      ...body,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("engorda")
      .insert([payload])
      .select();

    if (error) {
      console.error("[Engorda API] Erro ao cadastrar:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      ok: true,
    });
  } catch (error) {
    console.error("[Engorda API] Erro interno:", error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
