// CAMINHO: app/api/cfo/decisoes/latest/route.ts
// Next.js 16 + TypeScript strict
// Leitura segura — CFO Decisions (Dashboard)
// Equação Y preservada (somente leitura)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("cfo_decisoes")
      .select(
        `
        id,
        origem,
        nivel,
        resultado_operacional,
        margem_percentual,
        mensagem,
        criado_em
      `
      )
      .order("criado_em", { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      status: "ok",
      total: data.length,
      decisoes: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        erro: "Erro ao consultar decisões do CFO",
        detalhe: error.message,
      },
      { status: 500 }
    );
  }
}
