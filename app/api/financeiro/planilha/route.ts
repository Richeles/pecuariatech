// app/api/financeiro/planilha/route.ts
// PecuariaTech — Planilha Financeira Progressiva
//
// Âncora de dados: financeiro_lancamentos_view
// Âncora de plano: assinatura_ativa_view
// Regra Z: erro técnico = degraded
// Next.js 16 + Supabase SSR cookie-first
// Runtime Canônico Premium

import {
  NextResponse,
} from "next/server";

import {
  createSSRClient,
} from "@/app/lib/supabase/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* =====================================================
   TYPES
===================================================== */

type NivelPlano =
  | "basico"
  | "profissional"
  | "ultra"
  | "empresarial"
  | "premium";

type PlanilhaRow = {

  id: string;

  data: string;

  tipo: string;

  valor: number;

  categoria:
    string | null;

  descricao:
    string | null;
};

type ResponseOK = {

  ok: true;

  ativo: true;

  plano: string;

  nivel: NivelPlano;

  locked: false;

  template: string;

  sections: string[];

  features:
    Record<string, boolean>;

  limit_rows: number;

  allow_export: boolean;

  rows: PlanilhaRow[];

  degraded?: true;

  reason?: string;

  ts: string;
};

/* =====================================================
   JSON
===================================================== */

function json(
  data: any,
  status = 200
) {

  return NextResponse.json(

    data,

    {

      status,

      headers: {

        "Cache-Control":
          "no-store",
      },
    }
  );
}

/* =====================================================
   HELPERS
===================================================== */

function normalizeAtiva(
  v?: string | null
) {

  const s =
    String(v ?? "")
      .toLowerCase();

  return (

    s === "ativa" ||
    s === "ativo" ||
    s === "active"
  );
}

function nivelFromPlano(
  plano?: string | null
): NivelPlano {

  const p =
    String(plano ?? "")
      .toLowerCase();

  if (
    p.includes("premium")
  ) {

    return "premium";
  }

  if (
    p.includes("empres")
  ) {

    return "empresarial";
  }

  if (
    p.includes("ultra")
  ) {

    return "ultra";
  }

  if (
    p.includes("prof")
  ) {

    return "profissional";
  }

  return "basico";
}

function model(
  nivel: NivelPlano
) {

  const base = {

    template:
      "basico",

    sections: [

      "Receitas",

      "Custos",

      "Resultado",

      "Margem",
    ],

    features: {

      dre: true,
    },

    limit_rows: 120,

    allow_export: false,
  };

  if (
    nivel ===
    "profissional"
  ) {

    return {

      ...base,

      limit_rows: 400,

      allow_export: true,
    };
  }

  if (
    nivel === "ultra"
  ) {

    return {

      ...base,

      limit_rows: 800,

      allow_export: true,
    };
  }

  if (
    nivel ===
    "empresarial"
  ) {

    return {

      ...base,

      limit_rows: 1200,

      allow_export: true,
    };
  }

  if (
    nivel ===
    "premium"
  ) {

    return {

      ...base,

      limit_rows: 2000,

      allow_export: true,
    };
  }

  return base;
}

/* =====================================================
   GET
===================================================== */

export async function GET() {

  try {

    /* ==========================================
       SSR CLIENT
    ========================================== */

    const supabase =
      await createSSRClient();

    /* ==========================================
       AUTH
    ========================================== */

    const {

      data: auth,

      error: authError,

    } =
      await supabase.auth.getUser();

    /* ==========================================
       REGRA Z
    ========================================== */

    if (
      authError ||
      !auth?.user
    ) {

      return json(

        {

          ok: false,

          reason:
            "no_session",
        },

        401
      );
    }

    const userId =
      auth.user.id;

    /* ==========================================
       PLANO
    ========================================== */

    let plano =
      "basico";

    let nivel:
      NivelPlano =
        "basico";

    const view =
      await supabase

        .from(
          "assinatura_ativa_view"
        )

        .select(
          "status, plano, nivel"
        )

        .eq(
          "user_id",
          userId
        )

        .maybeSingle();

    if (

      view.data &&
      normalizeAtiva(
        view.data.status
      )

    ) {

      plano =
        view.data.plano ??
        "basico";

      nivel =
        view.data.nivel ??
        nivelFromPlano(
          plano
        );
    }

    /* ==========================================
       CONFIG
    ========================================== */

    const cfg =
      model(nivel);

    /* ==========================================
       QUERY
    ========================================== */

    const q =
      await supabase

        .from(
          "financeiro_lancamentos_view"
        )

        .select(
          `
            id,
            data,
            tipo,
            valor,
            categoria,
            descricao
          `
        )

        .eq(
          "user_id",
          userId
        )

        .order(
          "data",
          {
            ascending: false,
          }
        )

        .limit(
          cfg.limit_rows
        );

    /* ==========================================
       DEGRADED
    ========================================== */

    if (q.error) {

      return json({

        ok: true,

        ativo: true,

        plano,

        nivel,

        locked: false,

        ...cfg,

        rows: [],

        degraded: true,

        reason:
          "financeiro_query_error",

        ts:
          new Date()
            .toISOString(),
      });
    }

    /* ==========================================
       PAYLOAD
    ========================================== */

    const payload:
      ResponseOK = {

      ok: true,

      ativo: true,

      plano,

      nivel,

      locked: false,

      ...cfg,

      rows:
        q.data as
          PlanilhaRow[],

      ts:
        new Date()
          .toISOString(),
    };

    /* ==========================================
       SUCCESS
    ========================================== */

    return json(
      payload
    );

  } catch (
    e: any
  ) {

    /* ==========================================
       FAIL SAFE
    ========================================== */

    return json(

      {

        ok: true,

        ativo: true,

        degraded: true,

        reason:
          "internal_error",

        message:
          e?.message ??
          "unknown",
      },

      200
    );
  }
}