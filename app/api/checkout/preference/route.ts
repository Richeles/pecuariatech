// app/api/checkout/preference/route.ts
// Next.js 16 + TypeScript strict
// Checkout Mercado Pago — Fonte Y preservada

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

// ================================
// CONFIGURAÇÃO MERCADO PAGO (SERVER)
// ================================
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
}

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
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
    // ================================
    // BODY
    // ================================
    const body = await req.json();
    const { plano, user_id, periodo } = body ?? {};

    // ================================
    // VALIDAÇÕES FORTES (ANTI-ERRO)
    // ================================
    if (!plano || typeof plano !== "string") {
      return NextResponse.json(
        { error: "Plano não informado ou inválido" },
        { status: 400 }
      );
    }

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json(
        { error: "User_id não informado ou inválido" },
        { status: 400 }
      );
    }

    if (!periodo || typeof periodo !== "string") {
      return NextResponse.json(
        { error: "Período não informado ou inválido" },
        { status: 400 }
      );
    }

    const selecionado = PLANOS[plano];
    if (!selecionado) {
      return NextResponse.json(
        { error: "Plano inexistente" },
        { status: 400 }
      );
    }

    // ================================
    // EXTERNAL REFERENCE (EQUAÇÃO Y)
    // user_id|plano|periodo
    // ================================
    const externalReference = `${user_id}|${plano}|${periodo}`;

    const preference = new Preference(mp);

    // ================================
    // CRIA PREFERENCE (PADRÃO MP)
    // ================================
    const result = await preference.create({
      body: {
        items: [
          {
            id: plano,
            title: selecionado.titulo,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(selecionado.preco),
          },
        ],
        external_reference: externalReference,
        back_urls: {
          success: "https://www.pecuariatech.com/checkout/sucesso",
          failure: "https://www.pecuariatech.com/checkout/erro",
          pending: "https://www.pecuariatech.com/checkout/pendente",
        },
        auto_return: "approved",
        statement_descriptor: "PECUARIATECH",
      },
    });

    if (!result.init_point) {
      throw new Error("Mercado Pago não retornou init_point");
    }

    return NextResponse.json({
      init_point: result.init_point,
    });
  } catch (err: any) {
    console.error("Erro Mercado Pago (RAW):", err);

    return NextResponse.json(
      {
        error: "Erro ao criar checkout",
        detalhe: err?.message ?? err,
      },
      { status: 500 }
    );
  }
}
