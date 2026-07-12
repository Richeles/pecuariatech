// app/api/dashboard/route.ts
// Next.js API Route – Proxy para o Python Runtime com Cache e Fallback
import { NextRequest, NextResponse } from "next/server";

// Cache em memória (última resposta válida)
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 60 segundos

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

    const pythonApi = process.env.PYTHON_API_URL || "https://pecuariatech-python-fs6m.onrender.com";
    const url = `${pythonApi}/api/pi/dashboard/${finalUserId}`;

    console.log(`[Proxy] 🔍 Buscando dados para user_id: ${finalUserId}`);
    console.log(`[Proxy] 📡 URL: ${url}`);

    // ⏱️ Timeout aumentado para 20 segundos (mas com fallback)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
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

        // 🔄 Fallback para cache (se disponível e válido)
        if (cachedData && (Date.now() - cacheTimestamp) < CACHE_TTL) {
          console.log(`[Proxy] 🔄 Usando cache (válido) devido a erro do Python`);
          return NextResponse.json(cachedData);
        }
        // Se cache expirado ou inexistente, retorna erro controlado
        return NextResponse.json(
          { error: `Python retornou ${response.status}`, details: errorText },
          { status: response.status }
        );
      }

      // ✅ Parse seguro do JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("[Proxy] ❌ JSON inválido:", parseError);
        // Fallback para cache se disponível
        if (cachedData && (Date.now() - cacheTimestamp) < CACHE_TTL) {
          console.log(`[Proxy] 🔄 Usando cache (válido) devido a JSON inválido`);
          return NextResponse.json(cachedData);
        }
        return NextResponse.json(
          { error: "Resposta do Python não é JSON válido" },
          { status: 500 }
        );
      }

      // ✅ Fallback para schema_version
      if (!data.schema_version) {
        data.schema_version = "1.0.0";
        data.api_version = "v1";
      }

      // 📊 Log resumido
      console.log(`[Proxy] ✅ Dados: user_id=${data.user_id}, score_pi=${data.score_pi}, gmd=${data.gmd}`);

      // 🔄 Atualiza o cache com a nova resposta válida
      cachedData = data;
      cacheTimestamp = Date.now();

      return NextResponse.json(data);

    } catch (error: any) {
      // Timeout (AbortError) ou erro de rede
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.error(`[Proxy] ❌ ERRO (${elapsed}ms):`, error?.message || error);

      // 🔄 FALLBACK OBRIGATÓRIO: se houver cache, retorna ele (mesmo que expirado)
      if (cachedData) {
        const idade = Date.now() - cacheTimestamp;
        console.log(`[Proxy] 🔄 Fallback para cache (idade: ${idade}ms)`);
        // Adiciona um header indicando que é cache
        const response = NextResponse.json(cachedData);
        response.headers.set('X-Cache-Status', 'stale');
        return response;
      }

      // 🚫 Se não há cache, retorna 503 (NUNCA 504)
      return NextResponse.json(
        { 
          error: "Serviço temporariamente indisponível. Tente novamente.", 
          status: "DEGRADED" 
        },
        { status: 503 }
      );
    }

  } catch (error: any) {
    // Erro externo (ex: problema no parsing da URL)
    console.error("[Proxy] ❌ ERRO EXTERNO:", error?.message || error);
    // Último recurso: se houver cache, usa ele
    if (cachedData) {
      console.log("[Proxy] 🔄 Fallback para cache (erro externo)");
      return NextResponse.json(cachedData);
    }
    return NextResponse.json(
      { error: `Erro interno: ${error?.message || "Desconhecido"}` },
      { status: 500 }
    );
  }
}