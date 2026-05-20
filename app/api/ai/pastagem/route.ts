// =========================================================
// PecuariaTech
// Pastagem AI Runtime API
// Ultra Premium Cognitive Runtime
// =========================================================

import { NextResponse }
from "next/server";

import {
  runtimePost,
  runtimeHealth,
}
from "@/app/lib/runtime";

// =========================================================
// RUNTIME
// =========================================================

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

// =========================================================
// GET
// =========================================================

export async function GET() {

  try {

    // =====================================================
    // HEALTH CHECK
    // =====================================================

    const health =
      await runtimeHealth();

    // =====================================================
    // PAYLOAD
    // =====================================================

    const payload = {

      lotacao_atual: 3.2,

      capacidade_suporte: 2.4,

      dias_sem_chuva: 24,

      umidade_solo: 31,

      risco_fogo: "medio",

      previsao_chuva_mm: 12,

      triangulo_360: {

        operacional:
          "pressao_pasto",

        tatico:
          "rotacao",

        executivo:
          "risco_estrutural",
      },

      cofatores: {

        biologico: 1.33,

        operacional:
          "pressao_alta",

        climatico:
          "seca_transicao",
      },
    };

    // =====================================================
    // RUNTIME POST
    // =====================================================

    const runtime =
      await runtimePost(
        "/pastagem/analisar",
        payload
      );

    // =====================================================
    // DEGRADED MODE
    // =====================================================

    if (!runtime?.ok) {

      return NextResponse.json({

        ok: false,

        degraded: true,

        runtime_online:
          health?.ok || false,

        advisory: [

          "Runtime cognitivo operando em modo degradado.",

          "Fallback estrutural ativado.",

          "Monitorar symbiosis Python.",
        ],

        error:
          runtime?.error ||
          "runtime_degraded",
      });
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({

      ok: true,

      runtime_online:
        true,

      engine:
        "PASTAGEM_COGNITIVE_ENGINE",

      governance:
        "TRIANGULAR_COGNITIVE_RUNTIME",

      symbiosis:
        "PYTHON_ACTIVE",

      ...runtime,
    });

  } catch (error: any) {

    // =====================================================
    // FAIL SAFE
    // =====================================================

    return NextResponse.json(

      {

        ok: false,

        degraded: true,

        runtime_online:
          false,

        advisory: [

          "Runtime indisponível.",

          "Entrando em fallback institucional.",

          "Governança cognitiva preservada.",
        ],

        error:
          error?.message ||
          "internal_runtime_error",
      },

      {
        status: 200,
      }
    );
  }
}