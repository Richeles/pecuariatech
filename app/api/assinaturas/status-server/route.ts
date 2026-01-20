// app/api/assinaturas/status-server/route.ts
import { NextResponse } from "next/server";

/**
 * ✅ Rota de compatibilidade (LEGADO)
 * Motivo:
 * - Algum client ainda chama /api/assinaturas/status-server
 * - Endpoint foi aposentado e agora gera 404 no log
 *
 * Solução:
 * - Repassa 100% para o endpoint canônico /api/assinaturas/status
 * - Mantém cookies SSR first
 * - Evita ruído e regressão
 */

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Mantém querystring (ts=...)
  const qs = url.search ? url.search : "";

  // Repassa para endpoint canônico na mesma origem
  const target = new URL(`/api/assinaturas/status${qs}`, url.origin);

  // Forward headers (cookies são essenciais aqui)
  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  const res = await fetch(target.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  // Retorna exatamente o payload do endpoint canônico
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}
