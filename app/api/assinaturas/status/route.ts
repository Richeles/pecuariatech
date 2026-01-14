// app/api/assinaturas/status/route.ts
// PecuariaTech Autônomo — SaaS por Plano (Âncora de Permissão) — International-grade
//
// Equação Y:
// Supabase (assinaturas + índices/IPCA) -> API canônica -> Middleware/Sidebar -> Produto
//
// Fonte da verdade:
// - public.assinaturas (webhook Mercado Pago)
// - (opcional) public.indices_economicos (IPCA anual)
//
// Derivação canônica (resposta):
// - ativo
// - plano (slug canônico internacional)
// - nivel (1..5)
// - beneficios (gate fino)
// - expires_at
// - pricing (base + adjustedByInflation)
// - inflation (metadados IPCA)
//
// Regras canônicas:
// - JWT obrigatório (401 sem Bearer)
// - auth.getUser() canônico (token via header)
// - read-only
// - fallback anti-quebra
// - pronto para middleware + sidebar
//
// Observação: ajuste automático IPCA
// - Preferência: tabela public.indices_economicos (year, ipca_rate)
// - Fallback: ENV IPCA_RATE_DEFAULT (ex.: 0.045)
// - Se não existir, assume 0 (não ajusta)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

// ===========================
// 1) Catálogo de Planos (GLOBAL)
// ===========================
// Slugs padronizados (sem acento, sem espaço) -> compatível internacionalmente
type PlanSlug =
  | "basico"
  | "profissional"
  | "ultra"
  | "empresarial"
  | "premium_dominus_360";

type BillingCycle = "mensal" | "trimestral" | "anual";

// Preços oficiais (do seu /planos)
const PLAN_PRICES_BRL: Record<BillingCycle, Record<PlanSlug, number>> = {
  mensal: {
    basico: 31.75,
    profissional: 52.99,
    ultra: 106.09,
    empresarial: 159.19,
    premium_dominus_360: 318.49,
  },
  trimestral: {
    basico: 79.38,
    profissional: 132.48,
    ultra: 265.23,
    empresarial: 397.98,
    premium_dominus_360: 796.23,
  },
  anual: {
    basico: 317.5,
    profissional: 529.9,
    ultra: 1060.9,
    empresarial: 1591.9,
    premium_dominus_360: 3184.9,
  },
};

// Nível por plano (1..5) -> base do gate fino
const PLAN_LEVEL: Record<PlanSlug, number> = {
  basico: 1,
  profissional: 2,
  ultra: 3,
  empresarial: 4,
  premium_dominus_360: 5,
};

// ===========================
// 2) Normalização e benefícios
// ===========================
function normalizePlano(raw: any): PlanSlug {
  const v = String(raw ?? "").toLowerCase().trim();

  if (!v) return "basico";

  // Premium Dominus 360
  if (v.includes("dominus") || v.includes("premium") || v.includes("360"))
    return "premium_dominus_360";

  // Empresarial
  if (v.includes("empres")) return "empresarial";

  // Ultra
  if (v.includes("ultra")) return "ultra";

  // Profissional/Pro
  if (v.includes("prof") || v.includes("pro")) return "profissional";

  // Básico
  if (v.includes("basic") || v.includes("básic") || v.includes("basico"))
    return "basico";

  // fallback seguro
  return "basico";
}

function normalizeCycle(raw: any): BillingCycle {
  const v = String(raw ?? "").toLowerCase().trim();
  if (v.includes("tri")) return "trimestral";
  if (v.includes("anu") || v.includes("year")) return "anual";
  return "mensal";
}

function buildBeneficiosByLevel(level: number) {
  // Gate fino (International-grade)
  // Observação: não depende do front existir ainda; é âncora do SaaS.
  return {
    // base
    dashboard: true,
    rebanho: true,
    pastagem: true,

    // módulos por nível
    financeiro: level >= 2,
    engorda: level >= 3,
    multiusuario: level >= 4,
    multifazendas: level >= 4,

    // premium
    cfo: level >= 5,
    esg: level >= 5,

    // flags futuras
    api_export: level >= 2,
    relatorios_premium: level >= 3,
  };
}

function money(n: number) {
  return Math.round(n * 100) / 100;
}

// ===========================
// 3) Inflação/IPCA — ajuste automático
// ===========================
// Estratégia:
// 1) tenta tabela indices_economicos (year, ipca_rate)
// 2) fallback env IPCA_RATE_DEFAULT (ex.: "0.045" = 4,5%)
// 3) fallback 0 (não ajusta)

function currentYearSP() {
  // timezone Brasil (SP). Para não depender de lib externa, usa Date() padrão.
  // Em produção isso é suficiente. Se quiser 100% timezone-safe, evoluímos depois.
  return new Date().getFullYear();
}

function parseRate(v: any): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  // Rate em formato decimal: 0.045 = 4,5%
  if (n < 0) return 0;
  if (n > 1) return Math.min(n / 100, 1); // se veio 4.5 assume %
  return n;
}

// Busca IPCA no Supabase (opcional)
async function fetchIpcaRate(
  supabase: ReturnType<typeof createClient>,
  year: number
): Promise<{ year: number; rate: number; source: "supabase" | "env" | "fallback" }> {
  // 1) tenta Supabase (se tabela existir)
  try {
    const { data, error } = await supabase
      .from("indices_economicos")
      .select("year, ipca_rate")
      .eq("year", year)
      .limit(1);

    if (!error && Array.isArray(data) && data[0]?.ipca_rate != null) {
      return { year, rate: parseRate(data[0].ipca_rate), source: "supabase" };
    }
  } catch {
    // tabela pode não existir — não quebra
  }

  // 2) ENV
  const envDefault = parseRate(process.env.IPCA_RATE_DEFAULT ?? "0");
  if (envDefault > 0) {
    return { year, rate: envDefault, source: "env" };
  }

  // 3) fallback
  return { year, rate: 0, source: "fallback" };
}

function applyInflation(price: number, rate: number) {
  return money(price * (1 + rate));
}

// ===========================
// 4) Handler GET
// ===========================
export async function GET(req: Request) {
  try {
    // 1) token obrigatório
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: missing bearer token" },
        { status: 401 }
      );
    }

    // 2) env obrigatório
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json(
        { error: "Server misconfigured: missing Supabase env (URL/ANON)" },
        { status: 500 }
      );
    }

    // 3) client canônico com Authorization header
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 4) validar sessão canônica
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized: invalid session",
          details: userErr?.message ?? null,
          debug: {
            tokenLength: token.length,
            tokenPrefix: token.slice(0, 18),
            supabaseUrlPrefix: url.slice(0, 35),
          },
        },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // 5) consultar assinatura (read-only)
    // anti-quebra: seleciona colunas comuns + opcionais
    const { data: rows, error } = await supabase
      .from("assinaturas")
      .select(
        `
        id,
        user_id,
        status,
        plano,
        plano_id,
        periodicidade,
        periodo,
        expires_at,
        updated_at,
        created_at
      `
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: "Supabase query error", details: error.message },
        { status: 500 }
      );
    }

    const list = Array.isArray(rows) ? rows : [];

    // assinatura ativa
    const active = list.find((r: any) =>
      String(r?.status ?? "").toLowerCase().includes("ativa")
    );

    // 6) Se não tem assinatura ativa: retorna baseline
    // Internacional: sempre retorna as estruturas necessárias.
    const year = currentYearSP();
    const inflation = await fetchIpcaRate(supabase, year);

    if (!active) {
      const plano: PlanSlug = "basico";
      const level = PLAN_LEVEL[plano];

      const baseMonthly = PLAN_PRICES_BRL.mensal[plano];
      const baseQuarter = PLAN_PRICES_BRL.trimestral[plano];
      const baseYearly = PLAN_PRICES_BRL.anual[plano];

      return NextResponse.json(
        {
          ativo: false,
          plano,
          nivel: level,
          cycle: "mensal" as BillingCycle,
          expires_at: null,
          beneficios: buildBeneficiosByLevel(level),

          // pricing internacional-grade
          currency: "BRL",
          pricing: {
            base: {
              mensal: money(baseMonthly),
              trimestral: money(baseQuarter),
              anual: money(baseYearly),
            },
            adjusted: {
              mensal: applyInflation(baseMonthly, inflation.rate),
              trimestral: applyInflation(baseQuarter, inflation.rate),
              anual: applyInflation(baseYearly, inflation.rate),
            },
            inflation,
          },
        },
        { status: 200 }
      );
    }

    // 7) derivar plano e período a partir da assinatura
    const plano = normalizePlano(active.plano ?? active.plano_id);
    const cycle = normalizeCycle(active.periodicidade ?? active.periodo ?? "mensal");
    const level = PLAN_LEVEL[plano];
    const beneficios = buildBeneficiosByLevel(level);

    const baseMonthly = PLAN_PRICES_BRL.mensal[plano];
    const baseQuarter = PLAN_PRICES_BRL.trimestral[plano];
    const baseYearly = PLAN_PRICES_BRL.anual[plano];

    return NextResponse.json(
      {
        ativo: true,
        plano,
        nivel: level,
        cycle,
        expires_at: active.expires_at ?? null,
        beneficios,

        currency: "BRL",
        pricing: {
          base: {
            mensal: money(baseMonthly),
            trimestral: money(baseQuarter),
            anual: money(baseYearly),
          },
          adjusted: {
            mensal: applyInflation(baseMonthly, inflation.rate),
            trimestral: applyInflation(baseQuarter, inflation.rate),
            anual: applyInflation(baseYearly, inflation.rate),
          },
          inflation,
        },

        assinatura: {
          id: active.id ?? null,
          status: active.status ?? null,
          updated_at: active.updated_at ?? null,
        },

        // debug operacional leve (sem vazar token)
        meta: {
          project: "PecuariaTech Autônomo",
          policy: "EquacaoY",
          gate: "plan-level",
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
