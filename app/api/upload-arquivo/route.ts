// app/api/upload-arquivo/route.ts
import { NextRequest, NextResponse } from "next/server";

// ============================================================
// CONFIGURAÇÕES
// ============================================================
const PYTHON_API_URL = process.env.PYTHON_API_URL || "https://pecuariatech-motor-pi.onrender.com";
const TIMEOUT_MS = 60000; // 60 segundos (cold start do Render pode demorar)

// ============================================================
// ENDPOINT DE UPLOAD – GATEWAY PARA O MOTOR π
// ============================================================
export async function POST(req: NextRequest) {
  console.log("🔍 [Upload] 1 - Recebi requisição POST");

  try {
    // ============================================================
    // ETAPA 1: Ler FormData
    // ============================================================
    const formData = await req.formData();
    console.log("🔍 [Upload] 2 - FormData lido com sucesso");

    const file = formData.get("file") as File | null;
    const tipo = formData.get("tipo") as string | null;
    const userId = formData.get("user_id") as string | null;
    const plano = formData.get("plano") as string | null;

    console.log("🔍 [Upload] 3 - Campos recebidos:", {
      file: file ? `${file.name} (${file.size} bytes)` : "null",
      tipo,
      userId,
      plano,
    });

    // Validação rápida
    if (!file) {
      console.warn("⚠️ [Upload] Arquivo não enviado");
      return NextResponse.json(
        { error: "Arquivo não enviado", detail: "Nenhum arquivo foi anexado." },
        { status: 400 }
      );
    }
    if (!tipo) {
      console.warn("⚠️ [Upload] Tipo não informado");
      return NextResponse.json(
        { error: "Tipo não informado", detail: "O campo 'tipo' é obrigatório." },
        { status: 400 }
      );
    }
    if (!userId) {
      console.warn("⚠️ [Upload] user_id não informado");
      return NextResponse.json(
        { error: "user_id não informado", detail: "O campo 'user_id' é obrigatório." },
        { status: 400 }
      );
    }

    // ============================================================
    // ETAPA 2: Preparar FormData para o Python
    // ============================================================
    const pythonForm = new FormData();
    pythonForm.append("file", file);
    pythonForm.append("tipo", tipo);
    pythonForm.append("user_id", userId);
    if (plano) pythonForm.append("plano", plano);

    const pythonUrl = `${PYTHON_API_URL}/api/importar/arquivo`;
    console.log(`🔍 [Upload] 4 - Chamando Python: ${pythonUrl}`);

    // ============================================================
    // ETAPA 3: Chamar o Motor π com timeout
    // ============================================================
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(pythonUrl, {
      method: "POST",
      body: pythonForm,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log(`🔍 [Upload] 5 - Python respondeu com status: ${response.status}`);

    // ============================================================
    // ETAPA 4: Ler a resposta (mesmo se for erro)
    // ============================================================
    const responseText = await response.text();
    console.log(`🔍 [Upload] 6 - Corpo da resposta (primeiros 500 chars):`, responseText.slice(0, 500));

    // Tenta parsear como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: "Resposta não é JSON", raw: responseText };
    }

    // ============================================================
    // ETAPA 5: Retornar resposta
    // ============================================================
    if (!response.ok) {
      console.error(`❌ [Upload] Python retornou erro ${response.status}:`, data);
      return NextResponse.json(
        {
          error: data.error || data.detail || `Motor π retornou ${response.status}`,
          detail: data.detail || data.message || data.raw || "Erro no processamento",
          traceback: data.traceback || null,
        },
        { status: response.status }
      );
    }

    // ============================================================
    // ETAPA 6: Sucesso
    // ============================================================
    console.log("✅ [Upload] Upload concluído com sucesso");
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ [Upload] ERRO no gateway:", error?.message || error);

    // Timeout (abort)
    if (error?.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Tempo limite excedido",
          detail: `O Motor π demorou mais de ${TIMEOUT_MS / 1000} segundos para processar o arquivo. Tente novamente.`,
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: "Erro interno no gateway",
        detail: error?.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}