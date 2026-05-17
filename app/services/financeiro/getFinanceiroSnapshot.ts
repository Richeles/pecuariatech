// ======================================================
// PecuariaTech
// Financeiro Snapshot Runtime
// Plataforma Operacional BioFinanceira
// ======================================================

import {
  createSSRClient,
} from "@/app/lib/supabase/server";

import {
  normalizeFinanceiro,
  normalizeApiResponse,
} from "@/app/lib/runtime-normalizer";

/* ======================================================
   TYPES
====================================================== */

export type FinanceiroSnapshot = {
  receita: number;
  despesas: number;
  lucro: number;
  margem: number;
};

/* ======================================================
   SERVICE
====================================================== */

export async function getFinanceiroSnapshot() {

  try {

    /* ==================================================
       SUPABASE
    ================================================== */

    const supabase =
      await createSSRClient();

    /* ==================================================
       AUTH
    ================================================== */

    const {
      data: {
        user,
      },
      error: authError,
    } =
      await supabase.auth.getUser();

    /* ==================================================
       REGRA Z
    ================================================== */

    if (
      authError ||
      !user
    ) {

      return normalizeApiResponse(

        {
          receita: 0,
          despesas: 0,
          lucro: 0,
          margem: 0,
        },

        "no_session"
      );
    }

    /* ==================================================
       VIEW
    ================================================== */

    const {
      data,
      error,
    } =
      await supabase

        .from(
          "financeiro_basico_view"
        )

        .select("*")

        .eq(
          "user_id",
          user.id
        )

        .maybeSingle();

    /* ==================================================
       DB ERROR
    ================================================== */

    if (error) {

      return normalizeApiResponse(

        {
          receita: 0,
          despesas: 0,
          lucro: 0,
          margem: 0,
        },

        error.message
      );
    }

    /* ==================================================
       NORMALIZATION
    ================================================== */

    const runtime =
      normalizeFinanceiro(
        data ?? {}
      );

    /* ==================================================
       SUCCESS
    ================================================== */

    return normalizeApiResponse(
      runtime,
      null
    );

  } catch (
    e: any
  ) {

    /* ==================================================
       FAIL SAFE
    ================================================== */

    return normalizeApiResponse(

      {
        receita: 0,
        despesas: 0,
        lucro: 0,
        margem: 0,
      },

      e?.message ??
      "internal_error"
    );
  }
}