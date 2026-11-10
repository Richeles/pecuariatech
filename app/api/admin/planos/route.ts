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

    // 3. π — CONSULTA DO CATÁLOGO EXISTENTE

    const { data, error } = await supabase
      .from("planos")
      .select("id, nome, nivel, preco, ativo")
      .order("preco", {
        ascending: true,
      });

    // 4. TRATAMENTO DE ERROS

    if (error) {
      console.error(
        "[ESR][ADMIN_PLANS] Falha na consulta:",
        {
          code: error.code,
          message: error.message,
        }
      );

      return NextResponse.json(
        { error: "plans_query_failed" },
        { status: 500 }
      );
    }

    // 5. Ω — RESPOSTA SEM CACHE

    return NextResponse.json(data ?? [], {
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