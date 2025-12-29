// CFO — Decisão mais recente
// Fonte Y

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase
      .from("cfo_decisoes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ decisao: data });
  } catch (err) {
    console.error("Erro decisão CFO:", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
