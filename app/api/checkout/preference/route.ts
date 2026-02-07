// app/api/checkout/preference/route.ts
// Checkout Mercado Pago — Preference (ESTÁVEL + teste R$10)

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ================================
// CORS — PRE-FLIGHT (CORREÇÃO CHAVE)
// ================================
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

// ================================
// PLANOS
// ================================
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
    titulo: "Plano Básico",
    precos: { mensal: 31.75, trimestral: 79.38, anual: 317.5 },
  },
  profissional: {
    titulo: "Plano Profissional",
    precos: { mensal: 52.99, trimestral: 132.48, anual: 529.9 },
  },
  ultra: {
    titulo: "Plano Ultra",
    precos: { mensal: 106.09, trimestral: 265.23, anual: 1060.9 },
  },
  empresarial: {
    titulo: "Plano Empresarial",
    precos: { mensal: 159.19, trimestral: 397.98, anual: 1591.9 },
  },
  premium_dominus: {
    titulo: "Premium Dominus 360°",
    precos: { mensal: 318.49, trimestral: 796.23, anual: 3184.9 },
  },
};

// ================================
// POST
// ================================
export async function POST(req: NextRequest) {
  try {
    const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!MP_TOKEN) {
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN ausente" },
        { status: 500 }
      );
    }

    const { plano, periodo, user_id } = await req.json();

    if (!plano || !PLANOS[plano]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    if (!["mensal", "trimestral", "anual"].includes(periodo)) {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 });
    }

    const preco = PLANOS[plano].precos[periodo];

    const origin =
      req.headers.get("origin") || "http://127.0.0.1:3333";

    const mp = new MercadoPagoConfig({
      accessToken: MP_TOKEN,
    });

    const preference = new Preference(mp);

    const preferenceBody = {
      items: [
        {
          title: `${PLANOS[plano].titulo} - ${periodo}`,
          quantity: 1,
          unit_price: Number(preco),
          currency_id: "BRL",
        },
      ],
      external_reference: user_id
        ? `${user_id}|${plano}|${periodo}`
        : `${plano}|${periodo}`,
      back_urls: {
        success: `${origin}/dashboard`,
        failure: `${origin}/planos`,
        pending: `${origin}/planos`,
      },
    };

    const result = await preference.create({
      body: preferenceBody,
    });

    if (!result?.init_point) {
      throw new Error("init_point não retornado");
    }

    return NextResponse.json(
      { init_point: result.init_point },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    console.error("CHECKOUT ERROR:", err);

    return NextResponse.json(
      {
        error: "Erro ao criar checkout",
        detalhe: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
