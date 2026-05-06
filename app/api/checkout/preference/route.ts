import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ================================
// PLANOS (FALLBACK LOCAL)
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
    // 🔥 ADMIN BYPASS (SEM PAGAMENTO)
    // ================================
    if (email === "pecuariatech2026@gmail.com") {
      return NextResponse.json({
        init_point: "/dashboard",
        admin: true,
      });
    }

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

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "email do usuário é obrigatório" },
        { status: 400 }
      );
    }

    // ================================
    // 🔥 PREÇO DINÂMICO (PYTHON)
    // ================================
    let preco = PLANOS[plano].precos[periodo]; // fallback

    try {
      const pricingRes = await fetch(
        process.env.PYTHON_API_URL || "http://127.0.0.1:8000/pricing",
        { cache: "no-store" }
      );

      if (pricingRes.ok) {
        const pricing = await pricingRes.json();

        const precoPython = pricing?.[plano]?.[periodo];

        if (precoPython && !isNaN(precoPython)) {
          preco = precoPython;
        }
      }
    } catch (err) {
      console.warn("⚠️ Python pricing indisponível, usando fallback local");
    }

    if (!preco || isNaN(preco)) {
      return NextResponse.json(
        { error: "Preço inválido", plano, periodo },
        { status: 500 }
      );
    }

    // ================================
    // ORIGIN
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
        email: email,
      },

      external_reference: `${user_id}|${plano}|${periodo}`,

      back_urls: {
        success: `${origin}/dashboard`,
        failure: `${origin}/planos`,
        pending: `${origin}/planos`,
      },

      notification_url: `${origin}/api/webhook/mercadopago`,
    };

    const result = await preference.create({
      body: preferenceBody,
    });

    if (!result?.init_point) {
      throw new Error("init_point não retornado");
    }

    return NextResponse.json({
      init_point: result.init_point,
    });

  } catch (err: any) {
    console.error("CHECKOUT ERROR:", err);

    return NextResponse.json(
      {
        error: "Erro no checkout",
        detalhe: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}