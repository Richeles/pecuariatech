import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "../../lib/supabase-server";
import { requireBenefitSSR } from "../../lib/getStatusPlanoSSR";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 120000;

export async function POST(req: NextRequest) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    // Identidade autenticada pela sessão SSR existente.
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // Única fonte de autorização comercial.
    // MASTER, Ultra, Empresarial e Dominus seguem os benefícios
    // concedidos pelo mecanismo central.
    const gate = await requireBenefitSSR("engorda_ultra", req);

    if (!gate.allowed) {
      return NextResponse.json(
        {
          error: "Benefício de Nutrição não disponível.",
          reason: gate.reason,
        },
        { status: gate.httpStatus }
      );
    }

    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      typeof body.pergunta !== "string"
    ) {
      return NextResponse.json(
        { error: "Informe uma pergunta válida." },
        { status: 400 }
      );
    }

    const pergunta = body.pergunta.trim();

    if (!pergunta) {
      return NextResponse.json(
        { error: "Pergunta vazia." },
        { status: 400 }
      );
    }

    if (pergunta.length > 12000) {
      return NextResponse.json(
        { error: "Consulta muito extensa. Reduza o contexto enviado." },
        { status: 413 }
      );
    }

    const pythonUrl =
      process.env.NURA_PYTHON_URL ||
      "http://127.0.0.1:8000/nura";

    const controller = new AbortController();

    timeoutId = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    let response: Response;

    try {
      response = await fetch(pythonUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          texto: pergunta,
          fazenda_id: user.id,
          user_id: user.id,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    if (!response.ok) {
      console.error(
        "[NURA][PYTHON] Backend indisponível. HTTP:",
        response.status
      );

      return NextResponse.json(
        { error: "Motor NURA indisponível no momento." },
        { status: 502 }
      );
    }

    const data = await response.json().catch(() => null);

    if (!data || typeof data.resposta !== "string") {
      return NextResponse.json(
        { error: "Resposta inválida do motor NURA." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      resposta: data.resposta,
      metadata: data.metadata ?? null,
    });
  } catch (error) {
    const aborted =
      error instanceof Error &&
      error.name === "AbortError";

    if (aborted) {
      return NextResponse.json(
        { error: "A NURA demorou muito. Tente novamente." },
        { status: 504 }
      );
    }

    console.error("[NURA][API]", error);

    return NextResponse.json(
      { error: "Não foi possível consultar o motor NURA." },
      { status: 500 }
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}