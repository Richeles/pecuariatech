import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Garantindo que as variáveis existem
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERRO: Variáveis de ambiente do Supabase não foram definidas.");
}

// Cliente oficial do Supabase — server only
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    // Consulta na tabela animals
    const { data, error } = await supabase
      .from("animals")
      .select("id, brinco, nome, sexo, categoria, peso_atual, lote_id, status")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
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

