// app/api/pastagem/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ✅ Equação Y (Âncora Arquitetural)
 * Fonte única da verdade: public.piquete_status_view (READ-ONLY)
 * - A API apenas CONSOME a view
 * - Nenhuma coluna é presumida
 * - Nenhuma lógica de mutação
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

function supabaseServerReadOnly() {
  // ✅ SERVER: sempre SUPABASE_URL + SUPABASE_ANON_KEY
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

export async function GET() {
  try {
    const sb = supabaseServerReadOnly();

    // ✅ 1) Leitura CANÔNICA da VIEW
    const { data, error } = await sb
      .from("piquete_status_view")
      .select(
        `
        piquete_id,
        nome,
        area_ha,
        tipo_pasto,
        capacidade_ua,
        status
        `
      )
      .order("nome", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Supabase: ${error.message}` },
        { status: 500 }
      );
    }

    const rows = data ?? [];

    // ✅ 2) KPIs EXECUTIVOS
    const total_piquetes = rows.length;

    const disponiveis = rows.filter(
      (p) => String(p.status ?? "").toLowerCase() === "disponivel"
    ).length;

    const ocupados = rows.filter(
      (p) => String(p.status ?? "").toLowerCase() === "ocupado"
    ).length;

    const area_total_ha = rows.reduce((acc, p) => acc + num(p.area_ha), 0);
    const capacidade_total_ua = rows.reduce(
      (acc, p) => acc + num(p.capacidade_ua),
      0
    );

    const taxa_ocupacao =
      total_piquetes > 0 ? ocupados / total_piquetes : 0;

    // ✅ 3) ALERTAS (camada inteligência inicial)
    const alertas: Alerta[] = [];

    if (taxa_ocupacao >= 0.8) {
      alertas.push({
        tipo: "critico",
        titulo: "Alta taxa de ocupação",
        detalhe:
          "Mais de 80% dos piquetes estão ocupados. Risco elevado de superpastejo.",
      });
    } else if (taxa_ocupacao >= 0.6) {
      alertas.push({
        tipo: "atencao",
        titulo: "Ocupação elevada",
        detalhe:
          "Acima de 60% dos piquetes ocupados. Monitorar rotação e carga animal.",
      });
    } else {
      alertas.push({
        tipo: "info",
        titulo: "Ocupação sob controle",
        detalhe:
          "Taxa de ocupação dentro do nível operacional saudável.",
      });
    }

    // ✅ 4) Resposta FINAL (estável e previsível)
    return NextResponse.json(
      {
        ok: true,
        fonte: "piquete_status_view",
        kpis: {
          total_piquetes,
          disponiveis,
          ocupados,
          area_total_ha: Number(area_total_ha.toFixed(2)),
          capacidade_total_ua: Number(capacidade_total_ua.toFixed(2)),
          taxa_ocupacao_percentual: Number(
            (taxa_ocupacao * 100).toFixed(0)
          ),
        },
        alertas,
        piquetes: rows,
      },
      { status: 200 }
    );
  } catch (e: any) {
    // ✅ NUNCA retorna HTML — só JSON
    return NextResponse.json(
      {
        ok: false,
        error:
          e?.message ??
          "Erro inesperado no endpoint /api/pastagem/status",
      },
      { status: 500 }
    );
  }
}
