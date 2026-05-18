import { NextResponse } from "next/server";

export async function GET() {

  try {

    // =====================================================
    // MOCK OPERACIONAL
    // Depois vamos conectar no Supabase real
    // =====================================================

    const payload = {

      ua_por_ha: 3.8,

      capacidade_suporte: 3.2,

      chuva_mm: 142,

      dias_sem_chuva: 4,

      recuperacao_pasto: 76,
    };

    // =====================================================
    // PYTHON RUNTIME
    // =====================================================

    const response = await fetch(

      "http://127.0.0.1:8000/pastagem/analisar",

      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

    if (!response.ok) {

      return NextResponse.json({

        ok: false,

        error:
          "python_runtime_error",
      });
    }

    const data = await response.json();

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({

      ok: true,

      runtime:
        "PASTAGEM_AI_RUNTIME",

      source:
        "equacao_y",

      ai:
        data,

      payload,
    });

  } catch (error: any) {

    return NextResponse.json({

      ok: false,

      error:
        error?.message ??
        "internal_error",
    });
  }
}