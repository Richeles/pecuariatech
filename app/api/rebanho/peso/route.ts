import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// POST /api/rebanho/peso
// Atualiza peso do animal
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const { id, peso } = await req.json();

    if (!id || peso === undefined) {
      return NextResponse.json(
        { error: "ID e peso são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("animals")
      .update({ peso })
      .eq("id", id);

    if (error) {
      console.error("Erro atualizar peso:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro peso:", err);
    return NextResponse.json(
      { error: "Erro interno ao atualizar peso" },
      { status: 500 }
    );
  }
}
