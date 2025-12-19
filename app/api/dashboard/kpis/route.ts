// app/api/dashboard/kpis/route.ts
// Next.js 16 + TypeScript strict

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Total de animais
    const { count: totalAnimais } = await supabase
      .from("animais")
      .select("*", { count: "exact", head: true });

    // Peso médio
    const { data: pesoData } = await supabase
      .from("animais")
      .select("peso");

    const pesoMedio =
      pesoData && pesoData.length > 0
        ? (
            pesoData.reduce(
              (s, a) => s + (a.peso || 0),
              0
            ) / pesoData.length
          ).toFixed(2)
        : "0";

    // Ganho médio diário
    const { data: ganhoData } = await supabase
      .from("animais")
      .select("ganho_medio_dia");

    const ganhoMedio =
      ganhoData && ganhoData.length > 0
        ? (
            ganhoData.reduce(
              (s, a) => s + (a.ganho_medio_dia || 0),
              0
            ) / ganhoData.length
          ).toFixed(2)
        : "0";

    // Custo médio
    const { data: custoData } = await supabase
      .from("animais")
      .select("custo_medio");

    const custoMedio =
      custoData && custoData.length > 0
        ? (
            custoData.reduce(
              (s, a) => s + (a.custo_medio || 0),
              0
            ) / custoData.length
          ).toFixed(2)
        : "0";

    return NextResponse.json({
      totalAnimais: totalAnimais || 0,
      pesoMedio,
      ganhoMedio,
      custoMedio,
    });
  } catch (err) {
    console.error("Erro KPIs:", err);
    return NextResponse.json(
      { error: "Erro ao buscar KPIs" },
      { status: 500 }
    );
  }
}
