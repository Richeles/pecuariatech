import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// GET /api/rebanho/listar
// Runtime-only | Equação Y | Build-safe
// =====================================================
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase ENV ausente");
      return NextResponse.json(
        { error: "Configuração do Supabase ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("animals")
      .select(
        `
        id,
        brinco,
        nome,
        sexo,
        categoria,
        peso,
        lote_id,
        status
        `
      )
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
