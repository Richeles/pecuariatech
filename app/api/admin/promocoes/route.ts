import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminMaster } from "@/app/services/admin/requireAdminMaster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DESCONTOS = [5, 10, 15, 20];

const PLANOS = [
  "basico",
  "profissional",
  "ultra",
  "empresarial",
  "premium_dominus",
];

const PERIODOS = ["mensal", "trimestral", "anual"];

function respostaErro(error: string, status: number) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    }
  );
}

async function obterContexto() {
  const authorization = await requireAdminMaster();

  if (!authorization.authorized) {
    return {
      authorized: false as const,
      response: respostaErro(
        authorization.status === 401
          ? "no_session"
          : authorization.status === 403
            ? "not_admin"
            : "admin_authorization_failed",
        authorization.status
      ),
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return {
      authorized: false as const,
      response: respostaErro("supabase_server_config_missing", 500),
    };
  }

  const supabase = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return {
    authorized: true as const,
    userId: authorization.userId,
    supabase,
  };
}

export async function GET() {
  try {
    const context = await obterContexto();

    if (!context.authorized) return context.response;

    const { data, error } = await context.supabase
      .from("promocoes_comerciais")
      .select(
        "id, ativo, desconto, periodos, planos, data_inicio, data_fim, criado_em, atualizado_em, atualizado_por"
      )
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("[ADMIN_PROMOCOES][GET]", error.code);

      return respostaErro("promotions_query_failed", 500);
    }

    return NextResponse.json(data ?? [], {
      status: 200,
      headers: { "Cache-Control": "private, no-store, no-cache" },
    });
  } catch (error) {
    console.error("[ADMIN_PROMOCOES][GET]", error);

    return respostaErro("internal_error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const context = await obterContexto();

    if (!context.authorized) return context.response;

    const body = await req.json();

    const id = String(body?.id ?? "");
    const desconto = Number(body?.desconto);
    const ativo = body?.ativo;
    const planos = body?.planos;
    const periodos = body?.periodos;
    const dataInicio = body?.data_inicio;
    const dataFim = body?.data_fim;

    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuid.test(id)) {
      return respostaErro("invalid_campaign_id", 400);
    }

    if (
      typeof ativo !== "boolean" ||
      !DESCONTOS.includes(desconto) ||
      !Array.isArray(planos) ||
      !Array.isArray(periodos) ||
      !planos.every((p: unknown) => typeof p === "string" && PLANOS.includes(p)) ||
      !periodos.every((p: unknown) => typeof p === "string" && PERIODOS.includes(p))
    ) {
      return respostaErro("invalid_campaign_configuration", 400);
    }

    if (ativo && (planos.length === 0 || periodos.length === 0)) {
      return respostaErro("active_campaign_requires_plans_and_periods", 400);
    }

    const inicio = dataInicio ? new Date(dataInicio) : null;
    const fim = dataFim ? new Date(dataFim) : null;

    if (
      ativo &&
      (!inicio ||
        !fim ||
        !Number.isFinite(inicio.getTime()) ||
        !Number.isFinite(fim.getTime()) ||
        fim.getTime() <= inicio.getTime())
    ) {
      return respostaErro("invalid_campaign_validity_period", 400);
    }

    const { data, error } = await context.supabase
      .from("promocoes_comerciais")
      .update({
        ativo,
        desconto,
        planos,
        periodos,
        data_inicio: inicio?.toISOString() ?? null,
        data_fim: fim?.toISOString() ?? null,
        atualizado_em: new Date().toISOString(),
        atualizado_por: context.userId,
      })
      .eq("id", id)
      .select(
        "id, ativo, desconto, planos, periodos, data_inicio, data_fim, atualizado_em, atualizado_por"
      )
      .maybeSingle();

    if (error) {
      console.error("[ADMIN_PROMOCOES][PATCH]", error.code);

      if (error.code === "23505") {
        return respostaErro("another_campaign_is_already_active", 409);
      }

      return respostaErro("promotion_update_failed", 500);
    }

    if (!data) {
      return respostaErro("campaign_not_found", 404);
    }

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[ADMIN_PROMOCOES][PATCH]", error);

    return respostaErro("internal_error", 500);
  }
}