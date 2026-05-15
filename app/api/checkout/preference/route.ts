// app/api/checkout/preference/route.ts
// PecuariaTech — Checkout Runtime Premium
// Equação Y + Regra Z + Runtime SaaS Seguro
// Mercado Pago Production Ready
// Admin sem bypass destrutivo
// Fluxo SaaS real restaurado

import {
  NextRequest,
  NextResponse,
} from "next/server";

import MercadoPagoConfig, {
  Preference,
} from "mercadopago";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* =====================================================
   PLANOS
===================================================== */

const PLANOS: Record<
  string,
  {
    titulo: string;

    precos: {
      mensal: number;
      trimestral: number;
      anual: number;
    };
  }
> = {

  basico: {

    titulo:
      "Plano Básico",

    precos: {

      mensal: 149.9,

      trimestral: 404.9,

      anual: 1439.9,
    },
  },

  profissional: {

    titulo:
      "Plano Profissional",

    precos: {

      mensal: 247.9,

      trimestral: 669.9,

      anual: 2379.9,
    },
  },

  ultra: {

    titulo:
      "Plano Ultra",

    precos: {

      mensal: 452.9,

      trimestral: 1222.9,

      anual: 4349.9,
    },
  },

  empresarial: {

    titulo:
      "Plano Empresarial",

    precos: {

      mensal: 627.9,

      trimestral: 1694.9,

      anual: 6029.9,
    },
  },

  premium_dominus: {

    titulo:
      "Premium Dominus 360°",

    precos: {

      mensal: 789.9,

      trimestral: 2132.9,

      anual: 7582.9,
    },
  },
};

/* =====================================================
   HELPERS
===================================================== */

function n(v: any): number {

  const x =
    Number(v);

  return Number.isFinite(x)
    ? x
    : 0;
}

function safeOrigin(
  req: NextRequest
) {

  return (
    process.env
      .NEXT_PUBLIC_SITE_URL ||

    process.env
      .NEXT_PUBLIC_APP_URL ||

    req.headers.get(
      "origin"
    ) ||

    "https://www.pecuariatech.com"
  );
}

/* =====================================================
   PYTHON PRICING
===================================================== */

async function getDynamicPrice(
  plano: string,
  periodo: string,
  fallback: number
) {

  try {

    const PYTHON_API =
      process.env
        .PYTHON_API_URL;

    /* ==========================================
       FAIL SAFE
    ========================================== */

    if (!PYTHON_API) {

      return fallback;
    }

    /* ==========================================
       FETCH
    ========================================== */

    const response =
      await fetch(
        `${PYTHON_API}/pricing`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

    if (
      !response.ok
    ) {

      return fallback;
    }

    const pricing =
      await response.json();

    const value =
      pricing?.[plano]?.[
        periodo
      ];

    const preco =
      n(value);

    return preco > 0
      ? preco
      : fallback;

  } catch {

    return fallback;
  }
}

/* =====================================================
   POST
===================================================== */

export async function POST(
  req: NextRequest
) {

  try {

    /* ==========================================
       ENV
    ========================================== */

    const MP_TOKEN =
      process.env
        .MERCADOPAGO_ACCESS_TOKEN;

    if (!MP_TOKEN) {

      return NextResponse.json(
        {
          ok: false,

          error:
            "MERCADOPAGO_ACCESS_TOKEN ausente",
        },
        {
          status: 500,
        }
      );
    }

    /* ==========================================
       BODY
    ========================================== */

    const body =
      await req.json();

    const {
      plano,
      periodo,
      user_id,
      email,
    } = body;

    /* ==========================================
       ADMIN MASTER
    ========================================== */

    const isMaster =
      email ===
      "pecuariatech2026@gmail.com";

    console.log(
      "[CHECKOUT]",
      {
        plano,
        periodo,
        email,
        isMaster,
      }
    );

    /* ==========================================
       VALIDATION
    ========================================== */

    if (
      !plano ||
      !PLANOS[plano]
    ) {

      return NextResponse.json(
        {
          ok: false,

          error:
            "Plano inválido",

          recebido:
            plano,
        },
        {
          status: 400,
        }
      );
    }

    if (
      ![
        "mensal",
        "trimestral",
        "anual",
      ].includes(periodo)
    ) {

      return NextResponse.json(
        {
          ok: false,

          error:
            "Período inválido",

          recebido:
            periodo,
        },
        {
          status: 400,
        }
      );
    }

    if (!user_id) {

      return NextResponse.json(
        {
          ok: false,

          error:
            "user_id é obrigatório",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !email ||
      typeof email !==
        "string"
    ) {

      return NextResponse.json(
        {
          ok: false,

          error:
            "email obrigatório",
        },
        {
          status: 400,
        }
      );
    }

    /* ==========================================
       PREÇO
    ========================================== */

    const fallbackPrice =
      PLANOS[
        plano
      ].precos[
        periodo as
          | "mensal"
          | "trimestral"
          | "anual"
      ];

    const preco =
      await getDynamicPrice(
        plano,
        periodo,
        fallbackPrice
      );

    if (
      !preco ||
      isNaN(preco)
    ) {

      return NextResponse.json(
        {
          ok: false,

          error:
            "Preço inválido",

          plano,

          periodo,
        },
        {
          status: 500,
        }
      );
    }

    /* ==========================================
       ORIGIN
    ========================================== */

    const origin =
      safeOrigin(req);

    /* ==========================================
       MERCADO PAGO
    ========================================== */

    const mp =
      new MercadoPagoConfig({

        accessToken:
          MP_TOKEN,
      });

    const preference =
      new Preference(mp);

    /* ==========================================
       URLS
    ========================================== */

    const successUrl =
      `${origin}/dashboard`;

    const failureUrl =
      `${origin}/planos`;

    const pendingUrl =
      `${origin}/planos`;

    const webhookUrl =
      `${origin}/api/webhook/mercadopago`;

    /* ==========================================
       PREFERENCE BODY
    ========================================== */

    const preferenceBody = {

      items: [

        {

          id:
            `${plano}_${periodo}`,

          title:
            `${PLANOS[plano].titulo} - ${periodo}`,

          description:
            `Assinatura ${PLANOS[plano].titulo}`,

          quantity: 1,

          currency_id:
            "BRL",

          unit_price:
            Number(preco),
        },
      ],

      payer: {

        email,
      },

      external_reference:
        `${user_id}|${plano}|${periodo}`,

      back_urls: {

        success:
          successUrl,

        failure:
          failureUrl,

        pending:
          pendingUrl,
      },

      auto_return:
        "approved",

      notification_url:
        webhookUrl,
    };

    /* ==========================================
       CREATE
    ========================================== */

    const result =
      await preference.create({
        body:
          preferenceBody,
      });

    if (
      !result?.init_point
    ) {

      throw new Error(
        "mercadopago_init_point_missing"
      );
    }

    /* ==========================================
       SUCCESS
    ========================================== */

    return NextResponse.json({

      ok: true,

      provider:
        "mercadopago",

      init_point:
        result.init_point,

      sandbox_init_point:
        result.sandbox_init_point,

      plano,

      periodo,

      preco,

      isMaster,
    });

  } catch (
    err: any
  ) {

    console.error(
      "[CHECKOUT_RUNTIME]",
      err
    );

    return NextResponse.json(
      {

        ok: false,

        error:
          "checkout_runtime_error",

        detalhe:
          String(
            err?.message ||
            err
          ),
      },
      {
        status: 500,
      }
    );
  }
}