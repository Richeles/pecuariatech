// app/api/checkout/preference/route.ts
// Next.js 16 + TypeScript strict
// Checkout Mercado Pago — Fonte Y preservada

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

// ================================
// CONFIGURAÇÃO MERCADO PAGO (SERVER)
// ================================
const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// ================================
// PLANOS — FONTE SIMPLES (CHECKOUT)
// A FONTE REAL CONTINUA NO WEBHOOK
// ================================
const PLANOS: Record<
  string,
  { titulo: string; preco: number }
> = {
  basico: { titulo: "Plano Básico", preco: 31.75 },
  profissional: { titulo: "Plano Profissional", preco: 52.99 },
  ultra: { titulo: "Plano Ultra", preco: 106.09 },
  empresarial: { titulo: "Plano Empresarial", preco: 159.19 },
  dominus360: { titulo: "Premium Dominus 360°", preco: 318.49 },
};

export async function POST(req: NextRequest) {
  try {
    const { plano, user_id, periodo } = await req.json();

    // ================================
    // VALIDAÇÕES FORTES
    // ================================
    if (!plano || !user_id || !periodo) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const selecionado = PLANOS[plano];
    if (!selecionado) {
      return NextResponse.json(
        { error: "Plano inválido" },
        { status: 400 }
      );
    }

    // ================================
    // CRIA EXTERNAL REFERENCE (Y)
    // user_id|plano_id|periodo
    // ================================
    const externalReference = `${user_id}|${plano}|${periodo}`;

    const preference = new Preference(mp);

    const result = await preference.create({
      body: {
        items: [
          {
            title: selecionado.titulo,
            quantity: 1,
            unit_price: selecionado.preco,
          },
        ],
        external_reference: externalReference,
        back_urls: {
          success: "https://www.pecuariatech.com/checkout/sucesso",
          failure: "https://www.pecuariatech.com/checkout/erro",
          pending: "https://www.pecuariatech.com/checkout/pendente",
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({
      init_point: result.init_point,
    });
  } catch (err) {
    console.error("Erro checkout:", err);
    return NextResponse.json(
      { error: "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}
