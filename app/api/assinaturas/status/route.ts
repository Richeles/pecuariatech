import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any) {
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

function isAtiva(status?: string | null) {
  const s = String(status ?? "").toLowerCase().trim();
  return s === "ativa" || s === "ativo" || s === "active";
}

export async function GET() {
  try {
    // =========================
    // 0) COOKIES + CLIENT
    // =========================
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    // =========================
    // 1) AUTH
    // =========================
    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) {
      return json({
        ok: true,
        ativo: false,
        reason: "no_session",
      });
    }

    // =========================
    // 2) ASSINATURA
    // =========================
    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("status, plano_id")
      .eq("user_id", auth.user.id)
      .order("atualizado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    let ativo = isAtiva(assinatura?.status);
    let plano_id = assinatura?.plano_id ?? null;

    // =========================
    // 3) OVERRIDE ADMIN (DEV / MASTER)
    // =========================
    try {
      const base =
        process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3333";

      const res = await fetch(`${base}/api/admin/override-plan`, {
        cache: "no-store",
      });

      if (res.ok) {
        const o = await res.json();
        if (o?.plano) {
          plano_id = o.plano;
          ativo = true;
        }
      }
    } catch {
      // silencioso por design
    }

    if (!ativo || !plano_id) {
      return json({
        ok: true,
        ativo: false,
        reason: "assinatura_inativa",
      });
    }

    // =========================
    // 4) PLANO (COLUNAS REAIS)
    // =========================
    const { data: plano } = await supabase
      .from("planos")
      .select("codigo, nome_exibicao, nivel_ordem")
      .eq("id", plano_id)
      .eq("ativo", true)
      .single();

    if (!plano) {
      return json({
        ok: true,
        ativo: false,
        reason: "plano_invalido",
      });
    }

    // =========================
    // 5) BENEFÍCIOS
    // =========================
    const { data: beneficios } = await supabase
      .from("planos_beneficios")
      .select("*")
      .eq("plano_codigo", plano.codigo)
      .single();

    // =========================
    // 6) RESPOSTA CANÔNICA
    // =========================
    return json({
      ok: true,
      ativo: true,
      plano: plano.codigo,
      plano_nome: plano.nome_exibicao,
      nivel: plano.nivel_ordem,
      beneficios: beneficios || {},
    });
  } catch (e: any) {
    return json({
      ok: false,
      ativo: false,
      reason: "internal_error",
      message: String(e?.message ?? e),
    });
  }
}
