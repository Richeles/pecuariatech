// app/api/cfo/indicadores/route.ts
// PecuariaTech CFO — Indicadores Financeiros
// Fonte Y: dre_mensal_view

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { erro: "Configuração Supabase ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from("dre_mensal_view")
      .select("*")
      .order("mes_referencia", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { erro: "Falha ao obter indicadores" },
        { status: 500 }
      );
    }

    const margem =
      data.receita_bruta > 0
        ? Number(
            ((data.resultado_operacional / data.receita_bruta) * 100).toFixed(2)
          )
        : 0;

    return NextResponse.json({
      mes: data.mes_referencia,
      receita: data.receita_bruta,
      despesas: data.despesas_operacionais,
      resultado: data.resultado_operacional,
      margem_percentual: margem,
    });
  } catch (err) {
    console.error("Erro CFO indicadores:", err);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
