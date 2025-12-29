// app/api/rebanho/cadastrar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("rebanho").insert(body);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erro cadastrar rebanho:", e);
    return NextResponse.json({ error: "Erro ao cadastrar" }, { status: 500 });
  }
}
