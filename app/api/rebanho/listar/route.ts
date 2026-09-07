import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// =====================================================
// GET /api/rebanho/listar
// Runtime-only | Equação Y | Build-safe
// =====================================================
export async function GET() {
  try {
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

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
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
      console.error("Erro Supabase listar:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro inesperado listar:", err);
    return NextResponse.json(
      { error: "Erro interno ao listar animais" },
      { status: 500 }
    );
  }
}
