import { NextResponse } from "next/server";

export async function GET() {

  try {

    // =====================================================
    // MOCK OPERACIONAL TEMPORÁRIO
    // =====================================================

    const payload = {

      animais: 248,

      peso_medio: 463,

      sem_peso: 4,

      sem_localizacao: 1,
    };

    // =====================================================
    // PYTHON RUNTIME
    // =====================================================

    const runtimeRes =
      await fetch(

        "http://127.0.0.1:8000/rebanho/analisar",

        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),

          cache: "no-store",
        }
      );

    // =====================================================
    // FAILSAFE
    // =====================================================

    if (!runtimeRes.ok) {

      return NextResponse.json({

        ok: false,

        runtime_online: false,

        runtime_status:
          "OFFLINE",

        executivo:
          "Falha no runtime Python.",

        operacional:
          "Engine cognitiva indisponível.",

        tatico:
          "Fallback estrutural ativado.",
      });
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    const runtime =
      await runtimeRes.json();

    return NextResponse.json({

      ok: true,

      ...runtime,
    });

  } catch (e: any) {

    // =====================================================
    // CATCH
    // =====================================================

    return NextResponse.json({

      ok: false,

      runtime_online: false,

      runtime_status:
        "OFFLINE",

      executivo:
        "Erro estrutural no runtime.",

      operacional:
        "Falha comunicação Python.",

      tatico:
        "Fallback de governança ativado.",

      error:
        e?.message ??
        "Erro desconhecido",
    });
  }
}