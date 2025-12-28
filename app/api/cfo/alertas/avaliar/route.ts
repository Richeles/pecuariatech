// app/api/cfo/alertas/avaliar/route.ts
// PecuariaTech CFO — Motor de Decisão
// Fonte Y: dre_mensal_view

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
        resultado_operacional
      `)
      .order("mes_referencia", { ascending: false })
      .limit(3);

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { erro: "Dados financeiros insuficientes para avaliação" },
        { status: 500 }
      );
    }

    const mesesNegativos = data.filter(
      (m) => m.resultado_operacional < 0
    ).length;

    const ultimoMes = data[0];

    let nivel = "ok";
    let motivo = "Operação saudável";

    if (ultimoMes.resultado_operacional < 0) {
      nivel = "alerta";
      motivo = "Resultado negativo no último mês";
    }

    if (mesesNegativos >= 2) {
      nivel = "critico";
      motivo = "Dois ou mais meses consecutivos com resultado negativo";
    }

    return NextResponse.json({
      status: "avaliado",
      sistema: "PecuariaTech CFO",
      nivel,
      motivo,
      referencia: ultimoMes.mes_referencia,
      resultado_operacional: ultimoMes.resultado_operacional,
      meses_negativos: mesesNegativos,
    });
  } catch (err) {
    console.error("Erro avaliação CFO:", err);
    return NextResponse.json(
      { erro: "Erro interno no motor CFO" },
      { status: 500 }
    );
  }
}
