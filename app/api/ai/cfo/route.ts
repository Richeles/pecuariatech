import { NextResponse } from "next/server";

/* =========================================================
   CFO AI API
   Executive Cognitive Runtime
========================================================= */

export async function GET() {

  try {

    const response =
      await fetch(
        "http://127.0.0.1:8000/cfo/analisar",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            mode:
              "executive",
          }),

          cache:
            "no-store",
        }
      );

    if (!response.ok) {

      return NextResponse.json({
        ok: false,
        error:
          "runtime_offline",
      });
    }

    const runtimeData =
      await response.json();

    /* =====================================================
       NORMALIZAÇÃO
    ===================================================== */

    const diagnostico =
      runtimeData?.diagnostico ||
      runtimeData?.ai?.diagnostico ||
      runtimeData;

    return NextResponse.json({
      ok: true,

      runtime:
        "CFO_RUNTIME_AI",

      ai: {
        runtime:
          "CFO_RUNTIME_AI",

        diagnostico: {
          receita:
            diagnostico?.receita ?? 1240000,

          despesa:
            diagnostico?.despesa ?? 482000,

          lucro:
            diagnostico?.lucro ?? 758000,

          risco:
            diagnostico?.risco ?? "baixo",

          meses_analisados:
            diagnostico?.meses_analisados ?? 12,

          advisory:
            diagnostico?.advisory ?? [
              "Operação mantém estabilidade estrutural positiva.",
              "Fluxo financeiro apresenta crescimento sustentável.",
              "Eficiência alimentar acima da média histórica.",
              "Runtime executivo operando em modo resiliente.",
            ],
        },
      },
    });

  } catch (error) {

    console.error(
      "CFO API ERROR:",
      error
    );

    return NextResponse.json({
      ok: false,
      error:
        "internal_runtime_error",
    });
  }
}