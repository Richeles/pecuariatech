// app/api/assinaturas/status/route.ts
// Âncora SaaS de Permissão — PecuariaTech
// Equação Y: Supabase (assinaturas) → API → Middleware
// Estável, read-only, sem crash e compatível com COOKIE e BEARER.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildBeneficios(nivel: number) {
  return {
    rebanho: true,
    pastagem: true,
    engorda: nivel >= 3,
    financeiro: nivel >= 3,
    cfo: nivel >= 5,
    esg: nivel >= 4,
    multiusuarios: nivel >= 4,
    suporte_vip: nivel >= 5,
  };
}

function normalizeAtivo(status: any) {
  const v = String(status ?? "").toLowerCase();
  return v.includes("ativa") || v.includes("active") || v === "true";
}

// ✅ Plano real vem por plano_id (join com planos_legacy)
// Se não tiver plano_id (caso legacy antigo), tenta proximo_plano
function normalizePlanoByNivel(nivel: string | number | null | undefined) {
  const n = Number(nivel ?? 1);

  if (n >= 5) return { plano: "premium_dominus_360", nivel: 5 };
  if (n >= 4) return { plano: "empresarial", nivel: 4 };
  if (n >= 3) return { plano: "ultra", nivel: 3 };
  if (n >= 2) return { plano: "profissional", nivel: 2 };
  return { plano: "basico", nivel: 1 };
}

function normalizePlanoFallback(row: any): { plano: string; nivel: number } {
  const p = String(row?.proximo_plano ?? "").toLowerCase();

  if (p.includes("premium")) return { plano: "premium_dominus_360", nivel: 5 };
  if (p.includes("empres")) return { plano: "empresarial", nivel: 4 };
  if (p.includes("ultra")) return { plano: "ultra", nivel: 3 };
  if (p.includes("prof")) return { plano: "profissional", nivel: 2 };
  return { plano: "basico", nivel: 1 };
}

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json({ ativo: false }, { status: 200 });
    }

    // ✅ Captura cookie da sessão (padrão)
    const cookie = req.headers.get("cookie") ?? "";

    // ✅ Captura bearer (fallback / debug)
    const authHeader = req.headers.get("authorization") ?? "";
    const bearer =
      authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : "";

    const supabase = createClient(url, anon, {
      global: {
        headers: {
          cookie,
          ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ✅ Se tem cookie válido OU bearer válido, isso retorna user
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return NextResponse.json({
        ativo: false,
        plano: "basico",
        nivel: 1,
        beneficios: buildBeneficios(1),
        expires_at: null,
      });
    }

    // ✅ Busca assinatura mais recente
    const { data: assinaturas } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("criado_em", { ascending: false })
      .limit(10);

    const ativa = (assinaturas ?? []).find((r: any) => normalizeAtivo(r.status));

    if (!ativa) {
      return NextResponse.json({
        ativo: false,
        plano: "basico",
        nivel: 1,
        beneficios: buildBeneficios(1),
        expires_at: null,
      });
    }

    // ✅ Se plano_id existe → join em planos_legacy para extrair nível
    let plano = "basico";
    let nivel = 1;

    if (ativa.plano_id) {
      const { data: planoLegacy } = await supabase
        .from("planos_legacy")
        .select("nivel")
        .eq("id", ativa.plano_id)
        .maybeSingle();

      const norm = normalizePlanoByNivel(planoLegacy?.nivel ?? 1);
      plano = norm.plano;
      nivel = norm.nivel;
    } else {
      const norm = normalizePlanoFallback(ativa);
      plano = norm.plano;
      nivel = norm.nivel;
    }

    return NextResponse.json({
      ativo: true,
      plano,
      nivel,
      beneficios: buildBeneficios(nivel),
      expires_at: ativa.renovacao_em ?? ativa.fim_trial ?? null,
    });
  } catch {
    // ✅ sem crash no middleware
    return NextResponse.json(
      { ativo: false, plano: "basico", nivel: 1, beneficios: buildBeneficios(1), expires_at: null },
      { status: 200 }
    );
  }
}
