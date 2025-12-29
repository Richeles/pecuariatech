// app/api/assinaturas/status/route.ts
// Runtime-only | Paywall simples | Equação Y

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    /**
     * Enquanto o login está pausado:
     * plano vem de cookie (mock controlado)
     */
    const plano = req.cookies.get("plano_ativo")?.value ?? "nenhum";

    return NextResponse.json({
      plano,
      ativo: plano !== "nenhum",
    });
  } catch (err) {
    console.error("Erro status assinatura:", err);
    return NextResponse.json(
      { error: "Erro interno status" },
      { status: 500 }
    );
  }
}
