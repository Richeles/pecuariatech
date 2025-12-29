// app/api/cfo/alertas/enviar/route.ts
// PecuariaTech CFO — Envio Controlado de Alertas
// Runtime-only | Equação Y | Build-safe

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// POST /api/cfo/alertas/enviar
// ===============================
export async function POST() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("ENV CFO ausente (alertas/enviar)");
      return NextResponse.json(
        { erro: "Configuração indisponível" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1️⃣ Reavaliar estado atual (Fonte Y)
    const { data: dre, error: dreError } = await supabase
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

    if (dreError || !dre) {
      return NextResponse.json({
        status: "ok",
        mensagem: "Sem dados financeiros para gerar alerta",
      });
    }

    const margem =
      dre.receita_bruta > 0
        ? dre.resultado_operacional / dre.receita_bruta
        : 0;

    let alerta = null;

    if (margem < 0) {
      alerta = {
        tipo: "critico",
        prioridade: "alta",
        mensagem:
          "Resultado operacional negativo. Revisão imediata recomendada.",
      };
    } else if (margem < 0.15) {
      alerta = {
        tipo: "atencao",
        prioridade: "media",
        mensagem:
          "Margem operacional abaixo do ideal. Avaliar eficiência.",
      };
    }

    // 2️⃣ Se não houver alerta, não registra nada
    if (!alerta) {
      return NextResponse.json({
        status: "ok",
        mensagem: "Nenhum alerta necessário no momento",
      });
    }

    // 3️⃣ Registrar alerta (Fonte Y de alertas)
    const { error: insertError } = await supabase
      .from("cfo_alertas")
      .insert({
        tipo: alerta.tipo,
        prioridade: alerta.prioridade,
        mensagem: alerta.mensagem,
        mes_referencia: dre.mes_referencia,
        origem: "motor_cfo",
        status: "gerado",
      });

    if (insertError) {
      console.error("Erro ao registrar alerta:", insertError);
      return NextResponse.json(
        { erro: "Falha ao registrar alerta" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      alerta_registrado: true,
      alerta,
    });
  } catch (err) {
    console.error("Erro API CFO alertas/enviar:", err);
    return NextResponse.json(
      { erro: "Erro interno no envio de alertas" },
      { status: 500 }
    );
  }
}
