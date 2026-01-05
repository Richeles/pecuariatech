// CAMINHO: app/api/planos/recomendacao/route.ts
// IA de Recomendação de Plano — integrada ao UltraCFO
// Server-only

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/financeiro/cfo/autonomo`,
      { cache: "no-store" }
    );

    const cfo = await res.json();

    if (!cfo?.plano_recomendado) {
      throw new Error("CFO sem recomendação");
    }

    return NextResponse.json({
      plano: cfo.plano_recomendado,
      motivo: cfo.mensagem,
      prioridade: cfo.prioridade,
      impacto: cfo.impacto_estimado,
    });
  } catch {
    return NextResponse.json({
      plano: "profissional",
      motivo:
        "Estamos analisando seus dados financeiros. O plano Profissional é o mais indicado neste momento.",
    });
  }
}
