// app/api/cfo/historico/route.ts
// PecuariaTech CFO — Histórico Financeiro
// Fonte Y: dre_mensal_view (Supabase)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("dre_mensal_view")
      .select(`
        mes_referencia,
        receita_bruta,
        despesas_operacionais,
        resultado_operacional
      `)
      .order("mes_referencia", { ascending: false })
      .limit(12);

    if (error || !data) {
      console.error("CFO Histórico erro:", error);
      return NextResponse.json(
        { erro: "Falha ao obter histórico financeiro CFO" },
        { status: 500 }
      );
    }

    const historico = data.map((item) => ({
      mes_referencia: item.mes_referencia,
      resultado_operacional: item.resultado_operacional,
      margem_percentual:
        item.receita_bruta > 0
          ? Number(
              (
                (item.resultado_operacional / item.receita_bruta) *
                100
              ).toFixed(2)
            )
          : 0,
    }));

    return NextResponse.json({
      status: "ok",
      sistema: "PecuariaTech CFO",
      historico,
    });
  } catch (err) {
    console.error("Erro API CFO Histórico:", err);
    return NextResponse.json(
      { erro: "Erro interno na API CFO Histórico" },
      { status: 500 }
    );
  }
}
