import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ================================
// PLANOS (FONTE ÚNICA - ATUALIZADA)
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
    precos: { mensal: 79.9, trimestral: 214.9, anual: 759.9 },
  },
  profissional: {
    titulo: "Plano Profissional",
    precos: { mensal: 132.9, trimestral: 357.9, anual: 1269.9 },
  },
  ultra: {
    titulo: "Plano Ultra",
    precos: { mensal: 265.9, trimestral: 716.9, anual: 2539.9 },
  },
  empresarial: {
    titulo: "Plano Empresarial",
    precos: { mensal: 397.9, trimestral: 1074.9, anual: 3819.9 },
  },
  premium_dominus: {
    titulo: "Premium Dominus 360°",
    precos: { mensal: 796.9, trimestral: 2149.9, anual: 7639.9 },
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

    const body = await req.json();
    const { plano, periodo, user_id, email } = body;

    // ================================
    // VALIDAÇÕES
    // ================================
    if (!plano || !PLANOS[plano]) {
      return NextResponse.json(
        { error: "Plano inválido", recebido: plano },
        { status: 400 }
      );
    }

    if (!["mensal", "trimestral", "anual"].includes(periodo)) {
      return NextResponse.json(
        { error: "Período inválido", recebido: periodo },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    // 🔥 AGORA O EMAIL É OBRIGATÓRIO (CORRETO EM PRODUÇÃO)
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "email do usuário é obrigatório para checkout" },
        { status: 400 }
      );
    }

    const preco = PLANOS[plano].precos[periodo];

    if (!preco || isNaN(preco)) {
      return NextResponse.json(
        { error: "Preço inválido", plano, periodo },
        { status: 500 }
      );
    }

    // ================================
    // ORIGIN (PRODUÇÃO + LOCAL)
    // ================================
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get("origin") ||
      "http://127.0.0.1:3333";

    // ================================
    // MERCADO PAGO
    // ================================
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
        email: email, // ✅ SEM fallback
      },

      // 🔑 FUNDAMENTAL (webhook + rastreabilidade)
      external_reference: `${user_id}|${plano}|${periodo}`,

      back_urls: {
        success: `${origin}/dashboard`,
        failure: `${origin}/planos`,
        pending: `${origin}/planos`,
      },

      // 🔥 WEBHOOK
      notification_url: `${origin}/api/webhook/mercadopago`,
    };

    // ================================
    // CRIA PREFERÊNCIA
    // ================================
    const result = await preference.create({
      body: preferenceBody,
    });

    if (!result?.init_point) {
      throw new Error("init_point não retornado pelo Mercado Pago");
    }

    return NextResponse.json({
      init_point: result.init_point,
    });

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