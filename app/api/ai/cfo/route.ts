// =========================================================
// PecuariaTech
// CFO AI Runtime API
// =========================================================

import { NextResponse }
from "next/server";

import { runtimePost }
from "@/app/lib/runtime";

// =========================================================
// GET
// =========================================================

export async function GET() {

  try {

    const payload = {

      resumo: {
        receita_total: 180000,
        custo_total: 110000,
        resultado_operacional: 70000,
      },

      mensal: [
        {
          mes: "JAN",
          resultado_operacional: 12000,
        },

        {
          mes: "FEV",
          resultado_operacional: 15000,
        },

        {
          mes: "MAR",
          resultado_operacional: 17000,
        },
      ],
    };

    const data =
      await runtimePost(
        "/cfo/analisar",
        payload
      );

    return NextResponse.json(data);

  } catch (error: any) {

    return NextResponse.json(
      {
        error:
          error?.message ||
          "runtime_error",
      },

      {
        status: 500,
      }
    );
  }
}