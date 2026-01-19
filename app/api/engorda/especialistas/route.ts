import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Plano vem do status canônico (já existe no seu SaaS)
    const cookieStore = await cookies();
    const plano = cookieStore.get("plano")?.value || "BASICO";

    // Somente Premium Dominus 360 libera especialistas
    if (plano !== "PREMIUM_DOMINUS_360") {
      return NextResponse.json(
        {
          ok: false,
          locked: true,
          reason: "Plano não inclui especialistas da Engorda",
        },
        { status: 403 }
      );
    }

    // Resposta neutra (sem prescrição, sem risco legal)
    return NextResponse.json({
      ok: true,
      domain: "engorda",
      specialists: {
        zootecnista: {
          foco: "Desempenho e ganho",
          mensagem:
            "Avaliar ajuste de manejo e dieta para maximizar ganho sem elevar risco.",
        },
        cfo: {
          foco: "Margem e custo",
          mensagem:
            "Monitorar custo/dia e ponto de equilíbrio antes de estender ciclo.",
        },
        risco_esg: {
          foco: "Conformidade e risco",
          mensagem:
            "Manter rastreabilidade ambiental e sanitária para evitar penalizações.",
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Falha ao avaliar especialistas da Engorda",
      },
      { status: 500 }
    );
  }
}
