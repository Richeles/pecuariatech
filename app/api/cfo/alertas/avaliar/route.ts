// app/api/cfo/alertas/avaliar/route.ts
// PecuariaTech CFO — Avaliação de Alertas
// Runtime-only | Equação Y | Build-safe

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// GET /api/cfo/alertas/avaliar
// ===============================
export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("ENV CFO ausente (alertas/avaliar)");
      return NextResponse.json(
        { erro: "Configuração indisponível" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 🔎 Fonte Y: indicadores financeiros recentes
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
      return NextResponse.json({
        status: "ok",
        alerta: null,
        mensagem: "Sem dados suficientes para avaliação",
      });
    }

    const margem =
      data.receita_bruta > 0
        ? data.resultado_operacional / data.receita_bruta
        : 0;

    // 🎯 Regra de negócio simples (evolutiva)
    let alerta = null;

    if (margem < 0) {
      alerta = {
        tipo: "critico",
        mensagem:
          "Resultado operacional negativo. Revisar custos imediatamente.",
        prioridade: "alta",
      };
    } else if (margem < 0.15) {
      alerta = {
        tipo: "atencao",
        mensagem:
          "Margem operacional baixa. Avaliar eficiência dos custos.",
        prioridade: "media",
      };
    }

    return NextResponse.json({
      status: "ok",
      sistema: "PecuariaTech CFO",
      mes_referencia: data.mes_referencia,
      alerta,
    });
  } catch (err) {
    console.error("Erro API CFO alertas/avaliar:", err);
    return NextResponse.json(
      { erro: "Erro interno na avaliação de alertas" },
      { status: 500 }
    );
  }
}
