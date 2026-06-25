// app/api/engorda/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET – Listar lotes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id") || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261";

    const { data, error } = await supabase
      .from("engorda")  // ← Tabela, não view
      .select("*")
      .eq("user_id", user_id)
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error("[Engorda API] Erro:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rows: data, ok: true });
  } catch (error) {
    console.error("[Engorda API] Erro interno:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST – Cadastrar lote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user_id = body.user_id || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261";

    const { data, error } = await supabase
      .from("engorda")
      .insert([{ ...body, user_id }])
      .select();

    if (error) {
      console.error("[Engorda API] Erro ao cadastrar:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, ok: true });
  } catch (error) {
    console.error("[Engorda API] Erro interno:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}