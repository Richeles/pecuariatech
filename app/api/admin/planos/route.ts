// =========================================================
// PECUARIATECH
// API ADMIN — PLANOS
//
// ESR + MPVEC SIMBIÓTICO
//
// X  = Interface administrativa
// Y  = Supabase / Verdade dos dados
// Z  = Identidade e autorização Master
// π  = Consulta do catálogo
// Ω  = Integridade da resposta
//
// REGRAS:
// - Acesso exclusivo do Admin Master.
// - Consulta somente leitura.
// - Preservar preços e níveis cadastrados.
// - Não interferir no checkout.
// =========================================================

import { NextResponse } from "next/server";

import { createSupabaseServer } from "@/app/lib/supabase-server";
import { requireAdminMaster } from "@/app/services/admin/requireAdminMaster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =========================================================
// GET — CATÁLOGO DE PLANOS
// =========================================================

export async function GET() {
  try {
    // 1. Z — AUTORIZAÇÃO ADMIN MASTER

    const authorization = await requireAdminMaster();

    if (!authorization.authorized) {
      const error =
        authorization.status === 401
          ? "no_session"
          : authorization.status === 403
            ? "not_admin"
            : "admin_authorization_failed";

      return NextResponse.json(
        { error },
        { status: authorization.status }
      );
    }

    // 2. Y — CLIENTE SUPABASE SSR

    const supabase = await createSupabaseServer();

    // 3. Y + π — CONSULTA DO CATÁLOGO E DOS PREÇOS ATUAIS

    const { data: planos, error: erroPlanos } = await supabase
      .from("planos")
      .select("id, codigo, nome_exibicao, nivel_ordem, ativo")
      .order("nivel_ordem", { ascending: true });

    if (erroPlanos) {
      console.error("[ESR][ADMIN_PLANS] Falha no catálogo:", {
        code: erroPlanos.code,
        message: erroPlanos.message,
      });

      return NextResponse.json(
        { error: "plans_catalog_query_failed" },
        { status: 500 }
      );
    }

    // Os preços atuais estão em planos_precos.
    // plano_codigo possui relação única com planos.codigo.

    const codigosPlanos = (planos ?? []).map(
      (plano) => plano.codigo
    );

    const precosPorCodigo = new Map<string, number>();

    if (codigosPlanos.length > 0) {
      const { data: precos, error: erroPrecos } = await supabase
        .from("planos_precos")
        .select("plano_codigo, preco_atual")
        .in("plano_codigo", codigosPlanos);

      if (erroPrecos) {
        console.error("[ESR][ADMIN_PLANS] Falha nos preços:", {
          code: erroPrecos.code,
          message: erroPrecos.message,
        });

        return NextResponse.json(
          { error: "plans_pricing_query_failed" },
          { status: 500 }
        );
      }

      for (const item of precos ?? []) {
        const valor = Number(item.preco_atual);

        if (Number.isFinite(valor)) {
          precosPorCodigo.set(item.plano_codigo, valor);
        }
      }
    }

    // Não apresentar preços fictícios quando faltar cadastro.
    const planosSemPreco = (planos ?? []).filter(
      (plano) => !precosPorCodigo.has(plano.codigo)
    );

    if (planosSemPreco.length > 0) {
      console.error("[ESR][ADMIN_PLANS] Planos sem preço:", {
        codigos: planosSemPreco.map((plano) => plano.codigo),
      });

      return NextResponse.json(
        { error: "plans_price_missing" },
        { status: 500 }
      );
    }

    // Mantém o contrato esperado pela página administrativa.
    const catalogo = (planos ?? []).map((plano) => ({
      id: plano.id,
      nome: plano.nome_exibicao,
      nivel: plano.codigo,
      preco: precosPorCodigo.get(plano.codigo)!,
      ativo: plano.ativo,
    }));
    // 5. Ω — RESPOSTA SEM CACHE

    return NextResponse.json(catalogo, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, no-cache, max-age=0",
      },
    });
  } catch (error) {
    console.error(
      "[ESR][ADMIN_PLANS] Erro interno:",
      error
    );

    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}