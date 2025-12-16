import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// GET /api/rebanho/listar
// Build-safe | Runtime-only | Equação Y compliant
// =====================================================
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("ERRO: Variáveis de ambiente do Supabase não definidas.");
      return NextResponse.json(
        { error: "Configuração do Supabase ausente" },
        { status: 500 }
      );
    }

    // 🔑 Cliente Supabase criado APENAS em runtime
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("animals")
      .select(
        "id, brinco, nome, sexo, categoria, peso_atual, lote_id, status"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro Supabase:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro inesperado:", err);
    return NextResponse.json(
      { error: "Erro interno ao listar animais" },
      { status: 500 }
    );
  }
}
