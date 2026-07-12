// app/api/dashboard/route.ts
// Next.js API Route – Proxy para o Python Runtime com Cache e Fallback
import { NextRequest, NextResponse } from "next/server";

let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 60 segundos

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const defaultUserId = process.env.DEFAULT_USER_ID || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261";
    const finalUserId = userId || defaultUserId;

    if (!finalUserId) {
      return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 });
    }

    const pythonApi = process.env.PYTHON_API_URL || "https://pecuariatech-python-fs6m.onrender.com";
    const url = `${pythonApi}/api/pi/dashboard/${finalUserId}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(url, {
        headers: { "Cache-Control": "no-cache" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Sem corpo");
        if (cachedData && (Date.now() - cacheTimestamp) < CACHE_TTL) {
          return NextResponse.json(cachedData);
        }
        return NextResponse.json(
          { error: `Python retornou ${response.status}`, details: errorText },
          { status: response.status }
        );
      }

      let data;
      try {
        data = await response.json();
      } catch {
        if (cachedData && (Date.now() - cacheTimestamp) < CACHE_TTL) {
          return NextResponse.json(cachedData);
        }
        return NextResponse.json({ error: "Resposta do Python não é JSON válido" }, { status: 500 });
      }

      if (!data.schema_version) {
        data.schema_version = "1.0.0";
        data.api_version = "v1";
      }

      cachedData = data;
      cacheTimestamp = Date.now();

      return NextResponse.json(data);

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (cachedData) {
        const response = NextResponse.json(cachedData);
        response.headers.set('X-Cache-Status', 'stale');
        return response;
      }
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível", status: "DEGRADED" },
        { status: 503 }
      );
    }

  } catch (error: any) {
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    return NextResponse.json(
      { error: `Erro interno: ${error?.message || "Desconhecido"}` },
      { status: 500 }
    );
  }
}