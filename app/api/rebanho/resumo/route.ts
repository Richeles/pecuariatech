import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// GET /api/rebanho/resumo
// =====================================================
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("animals")
      .select("id", { count: "exact" });

    if (error) {
      console.error("Erro resumo:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      total_animais: data?.length ?? 0,
    });
  } catch (err) {
    console.error("Erro resumo:", err);
    return NextResponse.json(
      { error: "Erro interno resumo" },
      { status: 500 }
    );
  }
}
