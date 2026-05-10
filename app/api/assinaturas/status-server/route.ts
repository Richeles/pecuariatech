// app/api/assinaturas/status-server/route.ts

import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================================================
 * PecuariaTech — Legacy Compatibility Route
 * ============================================================================
 *
 * Objetivo:
 * ---------------------------------------------------------------------------
 * Compatibilizar clients antigos que ainda consomem:
 *
 *   /api/assinaturas/status-server
 *
 * Endpoint oficial/canônico:
 *
 *   /api/assinaturas/status
 *
 * Estratégia:
 * ---------------------------------------------------------------------------
 * - Proxy transparente
 * - SSR cookie-first
 * - Zero lógica de assinatura aqui
 * - Zero leitura Supabase
 * - Zero divergência arquitetural
 *
 * Benefícios:
 * ---------------------------------------------------------------------------
 * ✅ Elimina 404 legado
 * ✅ Preserva middleware/paywall
 * ✅ Mantém compatibilidade retroativa
 * ✅ Evita drift entre endpoints
 * ✅ Centraliza regra de negócio
 *
 * Arquitetura:
 * ---------------------------------------------------------------------------
 * Regra canônica PecuariaTech:
 *
 *   assinatura/status = única fonte de verdade
 *
 * Este endpoint existe APENAS como camada de compatibilidade.
 * ============================================================================
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    /**
     * ------------------------------------------------------------------------
     * URL atual
     * ------------------------------------------------------------------------
     */
    const currentUrl = new URL(req.url);

    /**
     * ------------------------------------------------------------------------
     * Mantém querystring
     * Ex:
     *   ?ts=...
     * ------------------------------------------------------------------------
     */
    const qs = currentUrl.search ?? "";

    /**
     * ------------------------------------------------------------------------
     * Endpoint canônico
     * ------------------------------------------------------------------------
     */
    const target = new URL(
      `/api/assinaturas/status${qs}`,
      currentUrl.origin
    );

    /**
     * ------------------------------------------------------------------------
     * Forward headers
     * ------------------------------------------------------------------------
     * SSR COOKIE FIRST
     * ------------------------------------------------------------------------
     */
    const headers = new Headers();

    /**
     * Cookies SSR
     */
    const cookie = req.headers.get("cookie");

    if (cookie) {
      headers.set("cookie", cookie);
    }

    /**
     * Bearer token / mobile / fallback auth
     */
    const authorization = req.headers.get("authorization");

    if (authorization) {
      headers.set("authorization", authorization);
    }

    /**
     * User-Agent opcional (observabilidade)
     */
    const userAgent = req.headers.get("user-agent");

    if (userAgent) {
      headers.set("user-agent", userAgent);
    }

    /**
     * ------------------------------------------------------------------------
     * Request proxy
     * ------------------------------------------------------------------------
     */
    const response = await fetch(target.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
      redirect: "follow",
    });

    /**
     * ------------------------------------------------------------------------
     * Payload RAW
     * ------------------------------------------------------------------------
     * Mantém compatibilidade total:
     * - JSON
     * - text
     * - html
     * - edge cases
     * ------------------------------------------------------------------------
     */
    const body = await response.text();

    /**
     * ------------------------------------------------------------------------
     * Response final
     * ------------------------------------------------------------------------
     */
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ??
          "application/json; charset=utf-8",

        "cache-control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",

        pragma: "no-cache",
        expires: "0",

        /**
         * Observabilidade
         */
        "x-pecuariatech-legacy-route": "status-server",
        "x-pecuariatech-forwarded-to": "/api/assinaturas/status",
      },
    });
  } catch (error) {
    /**
     * ------------------------------------------------------------------------
     * Fail-safe
     * ------------------------------------------------------------------------
     * Nunca quebrar middleware/paywall por exceção não tratada.
     * ------------------------------------------------------------------------
     */
    console.error(
      "[PECUARIATECH][STATUS-SERVER][LEGACY_PROXY_ERROR]",
      error
    );

    return NextResponse.json(
      {
        ativo: false,
        error: "legacy_proxy_error",
        reason: "compatibility_route_failure",
      },
      {
        status: 500,
        headers: {
          "cache-control": "no-store",
        },
      }
    );
  }
}