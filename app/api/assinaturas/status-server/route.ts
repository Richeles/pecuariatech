// app/api/assinaturas/status-server/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { permissoesDoPlano, PlanoNivel } from "@/app/lib/planos/permissoes";

/**
 * ✅ Equação Y:
 * Banco (assinaturas.status) → API status-server (SSR cookie first) → middleware/paywall → UI
 *
 * ✅ Triângulo 360:
 * - Auth: cookie SSR
 * - Paywall: status assinatura
 * - Permissão: plano/nivel/benefícios
 *
 * REGRAS IMUTÁVEIS:
 * - Runtime only (nunca build-time)
 * - Read-only (não faz update)
 * - Sem supabase client global fora do handler
 * - COOKIE SSR FIRST (padrão SaaS PecuariaTech)
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") throw new Error(`ENV ausente: ${name}`);
  return v;
}

/**
 * ✅ Compatibilidade definitiva:
 * - Aceita "ativa", "ativo"
 * - Aceita "active"
 * - Aceita variações: "assinatura_ativa", "assinatura_ativo", etc.
 *
 * IMPORTANTE:
 * O webhook deve PADRONIZAR gravação futura para "ativa",
 * mas a API tem que aceitar "ativo" para não quebrar legado.
 */
function isAtiva(status: any): boolean {
  const v = String(status ?? "").toLowerCase().trim();
  if (v === "ativa" || v === "ativo") return true;
  if (v === "active") return true;
  return v.includes("ativa") || v.includes("ativo");
}

// ⚠️ Fallback seguro enquanto não houver mapa UUID → plano real
function planoFromPlanoId(_planoId: any): PlanoNivel {
  return "basico";
}

function planoToNivel(plano: PlanoNivel): number {
  switch (plano) {
    case "profissional":
      return 2;
    case "ultra":
      return 3;
    case "empresarial":
      return 4;
    case "premium_dominus":
      return 5;
    default:
      return 1;
  }
}

/**
 * ✅ Cookie SSR First:
 * - garante que o supabase server reconheça o usuário logado
 * - evita "no_user_session" quando cookie existe no browser
 */
function cookieHeaderFromNextCookies(): string {
  const store = cookies();
  // monta "cookie" header completo
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const debug = searchParams.get("debug") === "1";
  const health = searchParams.get("health") === "1";

  try {
    // ✅ Healthcheck (não depende de sessão)
    if (health) {
      return NextResponse.json(
        { ok: true, mode: "healthcheck", endpoint: "status-server" },
        { status: 200 }
      );
    }

    // ✅ ENVs (padrão do projeto)
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const anon =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json(
        { ok: false, error: "Env Supabase ausente" },
        { status: 500 }
      );
    }

    // ✅ COOKIE SSR FIRST (fonte real de sessão)
    const cookieFromBrowser =
      req.headers.get("cookie") ?? cookieHeaderFromNextCookies();

    const supabase = createClient(url, anon, {
      global: {
        headers: {
          cookie: cookieFromBrowser,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // ✅ 1) validar usuário com cookie
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return NextResponse.json(
        {
          ok: true,
          ativo: false,
          plano: "basico",
          nivel: 1,
          expires_at: null,
          beneficios: permissoesDoPlano("basico"),
          ...(debug
            ? {
                reason: "no_user_session",
                auth_error: userErr?.message ?? null,
              }
            : {}),
        },
        { status: 200 }
      );
    }

    // ✅ 2) consultar assinatura mais recente do user (Equação Y)
    const { data: rows, error: assErr } = await supabase
      .from("assinaturas")
      .select("plano_id,status,renovacao_em,fim_trial,criado_em")
      .eq("user_id", userData.user.id)
      .order("criado_em", { ascending: false })
      .limit(5);

    if (assErr) {
      return NextResponse.json(
        {
          ok: false,
          error: `Supabase(assinaturas): ${assErr.message}`,
        },
        { status: 500 }
      );
    }

    const assinaturaAtiva = (rows ?? []).find((r) => isAtiva(r.status));

    if (!assinaturaAtiva) {
      return NextResponse.json(
        {
          ok: true,
          ativo: false,
          plano: "basico",
          nivel: 1,
          expires_at: null,
          beneficios: permissoesDoPlano("basico"),
          ...(debug
            ? {
                reason: "no_active_subscription",
                last_status: rows?.[0]?.status ?? null,
                last_plano_id: rows?.[0]?.plano_id ?? null,
              }
            : {}),
        },
        { status: 200 }
      );
    }

    // ✅ 3) Plano e benefícios (nível SaaS)
    const plano = planoFromPlanoId(assinaturaAtiva.plano_id);
    const expires_at =
      assinaturaAtiva.renovacao_em ?? assinaturaAtiva.fim_trial ?? null;

    return NextResponse.json(
      {
        ok: true,
        ativo: true,
        plano,
        nivel: planoToNivel(plano),
        expires_at,
        beneficios: permissoesDoPlano(plano),
        ...(debug
          ? {
              debug_status: assinaturaAtiva.status ?? null,
              debug_plano_id: assinaturaAtiva.plano_id ?? null,
            }
          : {}),
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "Erro inesperado no status-server",
      },
      { status: 500 }
    );
  }
}
