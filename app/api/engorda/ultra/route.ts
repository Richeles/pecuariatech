import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ============================================================
 * ENGORDA ULTRA (API) — Equação Y
 * Views (Supabase) → API read-only → UI (Dashboard HUB)
 *
 * Triângulo 360:
 * - contábil   (E = margem)
 * - operacional(B = performance)
 * - estratégico(R = risco + ESG)
 * ============================================================
 */

function json(ok: boolean, status: number, data: any) {
  return NextResponse.json({ ok, ...data }, { status });
}

function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

function clamp(n: number, a = 0, b = 100) {
  const x = Number(n);
  if (!Number.isFinite(x)) return a;
  return Math.max(a, Math.min(b, x));
}

export async function GET(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return json(false, 401, { error: "Unauthorized: missing bearer token" });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) {
      return json(false, 500, { error: "Missing Supabase env vars" });
    }

    // ✅ regra: supabase dentro do handler
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    // ✅ Equação Y: origem canônica = 2 views
    const [baseRes, projRes] = await Promise.all([
      supabase.from("engorda_base_view").select("*").limit(200),
      supabase.from("engorda_projecao_view").select("*").limit(500),
    ]);

    const degraded = Boolean(baseRes.error || projRes.error);

    const base = baseRes.data ?? [];
    const proj = projRes.data ?? [];

    // ---------- util de campos flexíveis (não quebrar por schema)
    const get = (row: any, keys: string[], fallback: any = null) => {
      for (const k of keys) {
        if (row && row[k] !== undefined && row[k] !== null) return row[k];
      }
      return fallback;
    };

    // ---------- Construção do Motor π (Fase 1: heurística robusta)
    // π = (B × E × R) / K
    // Aqui: B=biológico (ganho/GMD/peso), E=margem, R=risco invertido, K=normalização
    const items = proj.map((r: any) => {
      const margem = Number(get(r, ["margem", "margem_brl", "margem_estimada"], 0)) || 0;
      const risco = Number(get(r, ["risco", "risco_score", "risco_total"], 0)) || 0;
      const peso = Number(get(r, ["peso", "peso_kg_atual", "peso_atual"], 0)) || 0;
      const gmd = Number(get(r, ["gmd", "gmd_estimado", "ganho_medio_dia"], 0)) || 0;

      const B = clamp((peso / 10) + (gmd * 20), 0, 120);
      const E = clamp(margem / 50, -100, 200); // normalização simples
      const R = clamp(100 - risco, 0, 100); // menor risco = maior R
      const K = 50;

      const PI = ((B * Math.max(E, 1) * Math.max(R, 1)) / K) / 100;
      return {
        brinco: get(r, ["brinco", "brinco_id", "id"], "-"),
        raca: get(r, ["raca", "raca_nome"], "-"),
        sexo: get(r, ["sexo"], "-"),
        peso,
        B,
        margem,
        risco,
        PI,
      };
    });

    // ranking top geral
    const top = [...items].sort((a, b) => (b.PI ?? 0) - (a.PI ?? 0)).slice(0, 60);

    // cenários:
    // OTIMO = maior PI
    // SEGURO = menor risco com PI decente
    // RAPIDO = maior B (biológico/giro)
    const OTIMO = [...top].sort((a, b) => (b.PI ?? 0) - (a.PI ?? 0)).slice(0, 25);
    const SEGURO = [...top].sort((a, b) => (a.risco ?? 0) - (b.risco ?? 0)).slice(0, 25);
    const RAPIDO = [...top].sort((a, b) => (b.B ?? 0) - (a.B ?? 0)).slice(0, 25);

    // ---------- KPIs
    const avg = (arr: any[], key: string) => {
      const xs = arr.map((x) => Number(x?.[key] ?? 0)).filter((n) => Number.isFinite(n));
      if (xs.length === 0) return 0;
      return xs.reduce((a, b) => a + b, 0) / xs.length;
    };

    const margem_media_top = avg(OTIMO, "margem");
    const risco_medio_top = avg(OTIMO, "risco");
    const pi_medio_top = avg(OTIMO, "PI");

    let risk_label: "OK" | "ATENCAO" | "CRITICO" = "OK";
    if (risco_medio_top >= 70) risk_label = "CRITICO";
    else if (risco_medio_top >= 40) risk_label = "ATENCAO";

    // ---------- ESG (Fase 1: modo compliance simples)
    // (você pode evoluir depois com view/colunas reais)
    const risco_ambiental_score = clamp(risco_medio_top, 0, 100);
    const selo_verde_status =
      risco_ambiental_score >= 70 ? "VERMELHO" : risco_ambiental_score >= 40 ? "AMARELO" : "VERDE";

    // ---------- Sinais Triângulo 360
    const sinais = [
      {
        eixo: "operacional",
        tipo: "info",
        codigo: "ENG_GIRO",
        severidade: risk_label === "CRITICO" ? "media" : "baixa",
        prioridade: 2,
        mensagem: "Cenário RÁPIDO prioriza giro biológico (B) e desempenho do lote.",
        acao_sugerida: "Avaliar oferta de dieta e curva de ganho para maximizar B com segurança.",
      },
      {
        eixo: "contabil",
        tipo: margem_media_top <= 0 ? "alerta" : "info",
        codigo: "ENG_MARGEM",
        severidade: margem_media_top <= 0 ? "alta" : "baixa",
        prioridade: margem_media_top <= 0 ? 1 : 3,
        mensagem:
          margem_media_top <= 0
            ? "Margem estimada negativa no topo do cenário ÓTIMO."
            : "Margem positiva no cenário ÓTIMO.",
        acao_sugerida:
          margem_media_top <= 0
            ? "Rever custo alimentar, mortalidade, prazo de abate e preço de venda."
            : "Manter disciplina operacional e proteger custo alimentar.",
      },
      {
        eixo: "estrategico",
        tipo: "info",
        codigo: "ENG_ESG",
        severidade: selo_verde_status === "VERMELHO" ? "alta" : selo_verde_status === "AMARELO" ? "media" : "baixa",
        prioridade: selo_verde_status === "VERMELHO" ? 1 : 2,
        mensagem: `Selo Verde/ESG em ${selo_verde_status} (compliance).`,
        acao_sugerida: "Validar origem, conformidade ambiental e controles sanitários.",
      },
    ] as const;

    const plano_acao = [
      {
        prioridade: 1,
        eixo: "contabil",
        titulo: "Proteger margem e custo alimentar",
        descricao: "Revisar rapidamente custo/dieta e preço alvo de venda para manter margem positiva.",
      },
      {
        prioridade: 2,
        eixo: "operacional",
        titulo: "Aumentar desempenho (B) com segurança",
        descricao: "Ajustar manejo, dieta e rotina para elevar ganho sem elevar risco.",
      },
      {
        prioridade: 3,
        eixo: "estrategico",
        titulo: "Mitigar risco e compliance ESG",
        descricao: "Monitorar risco e garantir conformidade ambiental/sanitária para evitar penalizações.",
      },
    ] as const;

    return json(true, 200, {
      domain: "engorda",
      ts: new Date().toISOString(),
      degraded,
      source: ["engorda_base_view", "engorda_projecao_view"],
      kpis: {
        total: proj.length,
        margem_media_top,
        risco_medio_top,
        pi_medio_top,
        risk_label,
      },
      motor_pi: {
        formula: "π=(B×E×R)/K",
        note: "Fase 1: heurística robusta e estável, sem dependência rígida de colunas.",
      },
      cenarios: { OTIMO, SEGURO, RAPIDO },
      esg: {
        enabled: true,
        selo_verde_status,
        risco_ambiental_score,
        message: "Compliance ESG (gestão de risco) — não auditoria.",
      },
      sinais: Array.from(sinais),
      plano_acao: Array.from(plano_acao),
    });
  } catch (e: any) {
    return json(false, 500, {
      domain: "engorda",
      degraded: true,
      error: e?.message ?? "Internal error",
    });
  }
}
