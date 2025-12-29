// app/api/cfo/historico-v2/route.ts
// PecuariaTech CFO — Histórico Financeiro
// Runtime-only | Build-safe | Equação Y aplicada

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// GET /api/cfo/historico-v2
// ===============================
export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("ENV CFO ausente (historico-v2)");
      return NextResponse.json(
        { erro: "Configuração do CFO indisponível" },
        { status: 500 }
      );
    }

    // 🔐 Supabase criado somente em runtime
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
      .limit(12); // últimos 12 meses

    if (error) {
      console.error("Erro histórico CFO:", error);
      return NextResponse.json(
        { erro: "Falha ao obter histórico financeiro" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      sistema: "PecuariaTech CFO",
      total_meses: data.length,
      historico: data,
    });
  } catch (err) {
    console.error("Erro API CFO histórico:", err);
    return NextResponse.json(
      { erro: "Erro interno na API CFO (histórico)" },
      { status: 500 }
    );
  }
}
