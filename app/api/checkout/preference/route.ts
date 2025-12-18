// app/api/checkout/preference/route.ts
// Next.js 16 + TypeScript strict

import { NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const runtime = "nodejs";

// ================================
// POST /api/checkout/preference
// ================================
export async function POST(req: Request) {
  try {
    const { plano_id } = (await req.json()) as {
      plano_id?: string;
    };

    if (!plano_id) {
      return NextResponse.json(
        { error: "plano_id obrigatório" },
        { status: 400 }
      );
    }

    // ================================
    // FONTE Y — PLANOS (BACKEND)
    // ================================
    const PLANOS: Record<
      string,
      { titulo: string; preco: number }
    > = {
      basico: { titulo: "Plano Básico", preco: 31.75 },
      profissional: { titulo: "Plano Profissional", preco: 52.99 },
      ultra: { titulo: "Plano Ultra", preco: 106.09 },
      empresarial: { titulo: "Plano Empresarial", preco: 159.19 },
      dominus: {
        titulo: "Premium Dominus 360",
        preco: 318.49,
      },
    };

    const plano = PLANOS[plano_id];

    if (!plano) {
      return NextResponse.json(
        { error: "Plano inválido" },
        { status: 400 }
      );
    }

    // ================================
    // CLIENTE MERCADO PAGO (PRODUÇÃO)
    // ================================
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: plano.titulo,
            quantity: 1,
            currency_id: "BRL",
            unit_price: plano.preco,
          },
        ],
        metadata: {
          plano_id,
        },
        back_urls: {
          success: "https://www.pecuariatech.com/dashboard",
          failure: "https://www.pecuariatech.com/planos",
          pending: "https://www.pecuariatech.com/planos",
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({
      init_point: result.init_point,
    });
  } catch (error) {
    console.error("Erro Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}
