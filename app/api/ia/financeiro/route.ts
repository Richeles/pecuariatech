// app/api/ia/financeiro/route.ts
// Execução automática da IA Financeira — PecuariaTech
// Server-only (Next.js 16 App Router)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    // 🔐 CRIAR CLIENT DENTRO DO HANDLER (OBRIGATÓRIO)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔎 BUSCAR DADOS DA IA
    const { data: registros, error } = await supabase
      .from("financeiro_ia_view")
      .select("*");

    if (error || !registros) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Sem dados" },
        { status: 500 }
      );
    }

    // 💾 SALVAR DECISÕES
    for (const r of registros) {
      await supabase.from("financeiro_ia_decisoes").insert({
        user_id: r.user_id,
        periodo: r.periodo,
        margem_percentual: r.margem_percentual,
        resultado_operacional: r.resultado_operacional,
        diagnostico: r.diagnostico,
        acao_recomendada: r.acao_recomendada,
      });
    }

    return NextResponse.json({
      ok: true,
      processados: registros.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
