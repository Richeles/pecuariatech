// app/api/cfo/indicadores/route.ts
// PecuariaTech CFO — Produção Real
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
      .select("*")
      .order("atualizado_em", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("CFO Supabase erro:", error);
      return NextResponse.json(
        { erro: "Falha ao obter indicadores financeiros" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      sistema: "PecuariaTech CFO",
      atualizado_em: data.atualizado_em,
      indicadores: {
        receita_total: data.receita_total,
        custo_total: data.custo_total,
        resultado_operacional: data.resultado_operacional,
        margem_percentual: data.margem_percentual,
      },
      diagnostico:
        data.resultado_operacional < 0
          ? "Resultado negativo. Ação corretiva imediata recomendada."
          : "Resultado saudável. Operação dentro do esperado.",
    });
  } catch (err) {
    console.error("Erro API CFO:", err);
    return NextResponse.json(
      { erro: "Erro interno na API PecuariaTech CFO" },
      { status: 500 }
    );
  }
}
