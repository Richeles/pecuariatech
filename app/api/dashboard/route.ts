// app/api/dashboard/route.ts
// Next.js API Route – Proxy para o Python Runtime
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    // ✅ Se não tiver user_id, usa o padrão da variável de ambiente ou fallback
    const defaultUserId = process.env.DEFAULT_USER_ID || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261";
    const finalUserId = userId || defaultUserId;

    if (!finalUserId) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    // ✅ CORREÇÃO: agora usa PYTHON_API_URL (mesmo nome da variável na Vercel)
    const pythonApi = process.env.PYTHON_API_URL || "https://pecuariatech-python-fs6m.onrender.com";
    const url = `${pythonApi}/api/pi/dashboard/${finalUserId}`;

    console.log(`[Proxy] 🔍 Buscando dados para user_id: ${finalUserId}`);
    console.log(`[Proxy] 📡 URL: ${url}`);

    // ⏱️ Timeout aumentado para 15 segundos (Render gratuito pode ser lento)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: { "Cache-Control": "no-cache" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const elapsed = Date.now() - startTime;
    console.log(`[Proxy] ⏱️ Tempo: ${elapsed}ms | Status: ${response.status}`);

    // ❌ Se o Python retornou erro
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Sem corpo");
      console.error(`[Proxy] ❌ Python erro ${response.status}: ${errorText}`);
      return NextResponse.json(
        { error: `Python retornou ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // ✅ Parse seguro do JSON (evita erro se o Python retornar HTML)
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("[Proxy] ❌ JSON inválido:", parseError);
      return NextResponse.json(
        { error: "Resposta do Python não é JSON válido" },
        { status: 500 }
      );
    }

    // ✅ Fallback para schema_version (evita erro no frontend)
    if (!data.schema_version) {
      data.schema_version = "1.0.0";
      data.api_version = "v1";
    }

    // 📊 Log resumido dos dados (apenas campos principais)
    console.log(`[Proxy] ✅ Dados: user_id=${data.user_id}, score_pi=${data.score_pi}, gmd=${data.gmd}, quantidade=${data.quantidade}`);

    return NextResponse.json(data);

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[Proxy] ❌ ERRO (${elapsed}ms):`, error?.message || error);

    // 🔥 Timeout (AbortError)
    if (error?.name === "AbortError") {
      return NextResponse.json(
        { error: "Timeout ao buscar dados do Python (15s)" },
        { status: 504 }
      );
    }

    // 🔥 Erro de rede (Python desligado)
    if (error?.code === "ECONNREFUSED") {
      return NextResponse.json(
        { error: "Python não está rodando na porta 8001" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Erro interno: ${error?.message || "Desconhecido"}` },
      { status: 500 }
    );
  }
}