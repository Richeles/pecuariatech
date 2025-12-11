import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// =====================================================
// ROTA /api/ultra
// Retorna valuation corporativo usando calcular_financas
// =====================================================
export async function GET() {
  try {
    // ---------------------------------------------------------
    // Valores temporários — você pode trocar para valores reais:
    // ---------------------------------------------------------
    const receita = 100000;     // Pode vir do rebanho no futuro
    const opex = 20000;
    const capex = 10000;
    const manutencao = 5000;
    const restauracao = 3000;

    // Chama a função RPC no Supabase
    const { data, error } = await supabase.rpc("calcular_financas", {
      receita,
      opex,
      capex,
      manutencao,
      restauracao,
    });

    if (error) {
      console.error("Erro na função calcular_financas:", error);
      return NextResponse.json(
        { error: "Erro na função de valuation." },
        { status: 500 }
      );
    }

    // Retorna o primeiro registro (data[0])
    return NextResponse.json({
      status: "ok",
      ebitda: data[0].ebitda,
      ebit: data[0].ebit,
      valuation_incremental: data[0].valuation_incremental,
      valuation_estrutural: data[0].valuation_estrutural,
      avaliacao_mercado: data[0].avaliacao_mercado,
      avaliacao_conservadora: data[0].avaliacao_conservadora,
      avaliacao_fundos: data[0].avaliacao_fundos,
      avaliacao_participacao: data[0].avaliacao_participacao,
    });
  } catch (e) {
    console.error("Erro inesperado:", e);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
