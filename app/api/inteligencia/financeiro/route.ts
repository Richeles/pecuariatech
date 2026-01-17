// app/api/inteligencia/financeiro/route.ts
import { NextResponse } from "next/server";
import { inteligenciaFinanceiro } from "@/app/lib/inteligencia/engine";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await inteligenciaFinanceiro();

    // Blindagem: se o engine retornar algo inválido, força modo seguro
    const safe =
      data && typeof data === "object"
        ? data
        : {
            ok: true,
            domain: "financeiro",
            degraded: true,
            kpis: {},
            sinais: [],
            resumo_executivo:
              "Modo seguro: retorno inválido do motor de inteligência. Nenhuma decisão deve ser tomada com este retorno.",
            error: "invalid_engine_return",
          };

    return NextResponse.json(safe, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: any) {
    // LOG SERVER-SIDE (Vercel)
    console.error("[CFO] /api/inteligencia/financeiro error:", err);

    // Modo seguro (nunca quebrar o SaaS)
    const degraded = {
      ok: true,
      domain: "financeiro",
      degraded: true,
      kpis: {},
      sinais: [],
      resumo_executivo:
        "Modo seguro: erro interno na coleta. Nenhuma decisão deve ser tomada com este retorno.",
      error: err?.message || "internal_error",
    };

    return NextResponse.json(degraded, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }
}
