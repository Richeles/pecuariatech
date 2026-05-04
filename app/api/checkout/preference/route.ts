import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ================================
// PLANOS (NÃO ALTERAR)
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

export async function POST(req: NextRequest) {
  try {
    const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!MP_TOKEN) {
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN ausente" },
        { status: 500 }
      );
    }

    const { plano, periodo, user_id, email } = await req.json();

    if (!plano || !PLANOS[plano]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    if (!["mensal", "trimestral", "anual"].includes(periodo)) {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    const preco = PLANOS[plano].precos[periodo];

    // 🔥 ORIGIN CORRETO (PRODUÇÃO + LOCAL)
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get("origin") ||
      "http://127.0.0.1:3333";

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

      payer: {
        email: email || "comprador@pecuariatech.com",
      },

      external_reference: `${user_id}|${plano}|${periodo}`,

      back_urls: {
        success: `${origin}/dashboard`,
        failure: `${origin}/planos`,
        pending: `${origin}/planos`,
      },

      // 🔥 ESSENCIAL PARA WEBHOOK FUNCIONAR
      notification_url: `${origin}/api/webhook/mercadopago`,
    };

    const result = await preference.create({
      body: preferenceBody,
    });

    if (!result?.init_point) {
      throw new Error("init_point não retornado pelo Mercado Pago");
    }

    return NextResponse.json({ init_point: result.init_point });

  } catch (err: any) {
    console.error("CHECKOUT ERROR FULL:", {
      message: err?.message,
      cause: err?.cause,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        error: "Erro no checkout",
        detalhe: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}