// app/api/upload-arquivo/route.ts

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 60000;

const PYTHON_API_URL =
  process.env.PYTHON_API_URL ||
  "https://pecuariatech-motor-pi.onrender.com";

console.log("==========================================");
console.log("✅ API Upload carregada");
console.log("Runtime:", runtime);
console.log("Python:", PYTHON_API_URL);
console.log("==========================================");

export async function POST(req: NextRequest) {
  const requestId = randomUUID().substring(0, 8);
  const start = Date.now();

  console.log(``);
  console.log(`==============================`);
  console.log(`[${requestId}] NOVO UPLOAD`);
  console.log(`==============================`);

  try {
    if (!PYTHON_API_URL) {
      console.error(`[${requestId}] PYTHON_API_URL não configurada`);

      return NextResponse.json(
        {
          error: "PYTHON_API_URL não configurada",
        },
        {
          status: 500,
        }
      );
    }

    console.log(`[${requestId}] Lendo FormData...`);

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const tipo = formData.get("tipo") as string | null;
    const userId = formData.get("user_id") as string | null;
    const plano = formData.get("plano") as string |null;

    console.log(`[${requestId}] Dados recebidos`);

    console.table({
      arquivo: file?.name,
      tamanho: file?.size,
      mime: file?.type,
      tipo,
      userId,
      plano,
    });

    if (!file)
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      );

    if (!tipo)
      return NextResponse.json(
        { error: "Tipo obrigatório" },
        { status: 400 }
      );

    if (!userId)
      return NextResponse.json(
        { error: "user_id obrigatório" },
        { status: 400 }
      );

    const pythonForm = new FormData();

    pythonForm.append("file", file);
    pythonForm.append("tipo", tipo);
    pythonForm.append("user_id", userId);

    if (plano)
      pythonForm.append("plano", plano);

    const url = `${PYTHON_API_URL}/api/importar/arquivo`;

    console.log(`[${requestId}] URL Python`);
    console.log(url);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

    console.log(`[${requestId}] Enviando arquivo ao Motor π`);

    const response = await fetch(url, {
      method: "POST",
      body: pythonForm,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    const tempo = Date.now() - start;

    console.log(
      `[${requestId}] Python respondeu (${response.status}) em ${tempo}ms`
    );

    const body = await response.text();

    console.log(
      `[${requestId}] Primeiros 500 caracteres`
    );

    console.log(body.substring(0, 500));

    let json: any;

    try {
      json = JSON.parse(body);
    } catch {
      json = {
        raw: body,
      };
    }

    if (!response.ok) {
      console.error(`[${requestId}] Erro vindo do Motor π`);

      return NextResponse.json(
        {
          error:
            json.error ??
            json.detail ??
            "Erro no Motor π",

          detail:
            json.detail ??
            json.message ??
            json.raw ??
            "",

          traceback:
            json.traceback ?? null,
        },
        {
          status: response.status,
        }
      );
    }

    console.log(`[${requestId}] Upload concluído`);

    return NextResponse.json(json);

  } catch (error: any) {

    console.error(`[${requestId}] ERRO GERAL`);

    console.error(error);

    if (error.name === "AbortError") {

      return NextResponse.json(
        {
          error: "Timeout",

          detail: `Motor π demorou mais de ${TIMEOUT_MS / 1000}s`,
        },
        {
          status: 504,
        }
      );

    }

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND"
    ) {

      return NextResponse.json(
        {
          error: "Motor π indisponível",

          detail: error.message,
        },
        {
          status: 503,
        }
      );

    }

    return NextResponse.json(
      {
        error: "Erro interno",

        detail: error.message,
      },
      {
        status: 500,
      }
    );
  }
}