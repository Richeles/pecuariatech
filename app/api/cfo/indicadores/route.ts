// app/api/cfo/indicadores/route.ts
// PecuariaTech CFO — Produção Real
// Fonte Y: dre_mensal_view (Supabase)
// Runtime-only | Build-safe | Equação Y aplicada

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// GET /api/cfo/indicadores
// ===============================
export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("ENV CFO ausente");
      return NextResponse.json(
        { erro: "Configuração do CFO indisponível" },
        { status: 500 }
      );
    }

    // 🔐 Supabase criado SOMENTE em runtime
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from("dre_mensal_view")
      .select(
        `
        mes_referencia,
        receita_bruta,
        despesas_operacionais,
        resultado_operacional
        `
      )
      .order("mes_referencia", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("CFO Supabase erro:", error);
      return NextResponse.json(
        { erro: "Falha ao obter indicadores financeiros" },
        { status: 500 }
      );
    }

    const margem_percentual =
      data.receita_bruta > 0
        ? Number(
            (
              (data.resultado_operacional / data.receita_bruta) *
              100
            ).toFixed(2)
          )
        : 0;

    return NextResponse.json({
      status: "ok",
      sistema: "PecuariaTech CFO",
      mes_referencia: data.mes_referencia,
      indicadores: {
        receita_bruta: data.receita_bruta,
        despesas_operacionais: data.despesas_operacionais,
        resultado_operacional: data.resultado_operacional,
        margem_percentual,
      },
      diagnostico:
        data.resultado_operacional < 0
          ? "Resultado negativo. Revisar custos operacionais com prioridade."
          : "Resultado positivo. Operação financeiramente saudável.",
    });
  } catch (err) {
    console.error("Erro API CFO:", err);
    return NextResponse.json(
      { erro: "Erro interno na API PecuariaTech CFO" },
      { status: 500 }
    );
  }
}
