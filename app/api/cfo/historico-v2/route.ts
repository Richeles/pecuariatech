// app/api/cfo/historico-v2/route.ts
// CFO — Histórico Financeiro
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

    const { data, error } = await supabase
      .from("dre_mensal_view")
      .select("*")
      .order("mes_referencia", { ascending: false })
      .limit(12);

    if (error) {
      return NextResponse.json(
        { erro: "Erro ao buscar histórico" },
        { status: 500 }
      );
    }

    return NextResponse.json({ historico: data });
  } catch (err) {
    console.error("Erro histórico CFO:", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
