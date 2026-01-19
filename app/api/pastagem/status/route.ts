// app/api/pastagem/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * ✅ Equação Y (Âncora Arquitetural)
 * Fonte única da verdade:
 * - Executivo: public.pastagem_status_view (READ-ONLY)
 * - Operacional: public.piquete_status_view (READ-ONLY)
 *
 * Regras:
 * - API apenas CONSOME views (read-only)
 * - Nenhuma mutação
 * - Runtime-only (nunca build-time)
 * - COOKIE SSR FIRST (padrão SaaS do PecuariaTech)
 */

export const dynamic = "force-dynamic"; // runtime-only (nunca build)

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`ENV ausente ou vazia: ${name}`);
  }
  return value;
}

/**
 * ✅ Next.js 16: cookies() é async → precisa await
 */
async function hasSupabaseCookie(): Promise<boolean> {
  const store = await cookies();

  // Supabase moderno costuma usar cookie sb-<project-ref>-auth-token
  const anySb = store.getAll().some((c) => c.name.includes("sb-"));
  if (anySb) return true;

  // fallback legado (raríssimo)
  if (store.get("sb-access-token") || store.get("sb-refresh-token")) return true;

  return false;
}

function supabaseServerReadOnly() {
  /**
   * ✅ Padrão read-only
   * Mantido o padrão de env para não quebrar:
   * SUPABASE_URL / SUPABASE_ANON_KEY
   */
  const url = getEnv("SUPABASE_URL");
  const anon = getEnv("SUPABASE_ANON_KEY");

  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normStatus(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type AlertaTipo = "critico" | "atencao" | "info";

type Alerta = {
  tipo: AlertaTipo;
  titulo: string;
  detalhe: string;
};

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    /**
     * ✅ HEALTHCHECK (sem sessão)
     * Permite testar LOCAL/REAL com curl sem precisar login.
     * NÃO vaza dados — só prova que endpoint está vivo.
     */
    if (url.searchParams.get("health") === "1") {
      return NextResponse.json(
        {
          ok: true,
          mode: "healthcheck",
          fonte: {
            executivo: "pastagem_status_view",
            operacional: "piquete_status_view",
          },
        },
        { status: 200 }
      );
    }

    // ✅ 0) COOKIE SSR FIRST (padrão SaaS)
    if (!(await hasSupabaseCookie())) {
      return NextResponse.json(
        { ok: false, reason: "no_session_cookie" },
        { status: 401 }
      );
    }

    const sb = supabaseServerReadOnly();

    // ✅ 1) EXECUTIVO (Equação Y): view âncora da pastagem
    const { data: resumo, error: resumoErr } = await sb
      .from("pastagem_status_view")
      .select(
        `
          escopo,
          qtd_piquetes,
          area_total_ha,
          area_ativa_ha,
          animais_total,
          ua_total,
          ua_por_ha_atual,
          ua_por_ha_suportada,
          ua_suportada_ativa,
          pressao_pastagem_score,
          risco_pastagem,
          decisao_recomendada,
          ultima_movimentacao_em
        `
      )
      .limit(1)
      .maybeSingle();

    if (resumoErr) {
      return NextResponse.json(
        { ok: false, error: `Supabase(resumo): ${resumoErr.message}` },
        { status: 500 }
      );
    }

    // ✅ 2) OPERACIONAL (Equação Y): detalhe por piquete
    const { data: piquetesData, error: piquetesErr } = await sb
      .from("piquete_status_view")
      .select(
        `
          piquete_id,
          nome,
          area_ha,
          tipo_pasto,
          capacidade_ua,
          status,
          ultima_movimentacao_em
        `
      )
      .order("nome", { ascending: true });

    if (piquetesErr) {
      return NextResponse.json(
        { ok: false, error: `Supabase(piquetes): ${piquetesErr.message}` },
        { status: 500 }
      );
    }

    const piquetes = piquetesData ?? [];

    // ✅ 3) KPIs auxiliares (derivação leve)
    const total_piquetes = piquetes.length;

    const disponiveis = piquetes.filter((p) => {
      const s = normStatus(p.status);
      return s.includes("disponivel") || s.includes("livre");
    }).length;

    const ocupados = piquetes.filter((p) => {
      const s = normStatus(p.status);
      return s.includes("ocupado") || s.includes("em_uso");
    }).length;

    const area_total_ha = piquetes.reduce((acc, p) => acc + num(p.area_ha), 0);
    const capacidade_total_ua = piquetes.reduce(
      (acc, p) => acc + num(p.capacidade_ua),
      0
    );

    const taxa_ocupacao = total_piquetes > 0 ? ocupados / total_piquetes : 0;

    // ✅ 4) ALERTAS executivos + operacionais
    const alertas: Alerta[] = [];
    const risco = String(resumo?.risco_pastagem ?? "").toUpperCase();

    if (risco === "ALTO") {
      alertas.push({
        tipo: "critico",
        titulo: "Risco alto na Pastagem",
        detalhe:
          "A view âncora identificou risco ALTO. Prioridade: regularizar área ativa, rotação e pressão de pastejo.",
      });
    } else if (risco === "MEDIO") {
      alertas.push({
        tipo: "atencao",
        titulo: "Risco médio na Pastagem",
        detalhe:
          "A pastagem está em zona de atenção. Ajustar rotação, descanso e monitorar pressão.",
      });
    } else {
      alertas.push({
        tipo: "info",
        titulo: "Pastagem sob controle",
        detalhe:
          "Risco baixo. Operação dentro do nível saudável conforme view âncora.",
      });
    }

    if (taxa_ocupacao >= 0.8) {
      alertas.push({
        tipo: "atencao",
        titulo: "Alta ocupação operacional",
        detalhe:
          "Mais de 80% dos piquetes estão ocupados. Verifique rotação e períodos de descanso.",
      });
    }

    // ✅ 5) Resposta final canônica
    return NextResponse.json(
      {
        ok: true,
        fonte: {
          executivo: "pastagem_status_view",
          operacional: "piquete_status_view",
        },
        resumo: resumo ?? null,
        kpis: {
          total_piquetes,
          disponiveis,
          ocupados,
          area_total_ha: Number(area_total_ha.toFixed(2)),
          capacidade_total_ua: Number(capacidade_total_ua.toFixed(2)),
          taxa_ocupacao_percentual: Number((taxa_ocupacao * 100).toFixed(0)),
        },
        alertas,
        piquetes,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "Erro inesperado no endpoint /api/pastagem/status",
      },
      { status: 500 }
    );
  }
}
