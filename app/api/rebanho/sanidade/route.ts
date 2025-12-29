import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// POST /api/rebanho/sanidade
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const { id, status_biologico } = await req.json();

    if (!id || !status_biologico) {
      return NextResponse.json(
        { error: "ID e status são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("animals")
      .update({ status_biologico })
      .eq("id", id);

    if (error) {
      console.error("Erro sanidade:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro sanidade:", err);
    return NextResponse.json(
      { error: "Erro interno sanidade" },
      { status: 500 }
    );
  }
}
