// CAMINHO: app/api/checkout/preference/route.ts
// Next.js 16 + TypeScript strict
// Checkout Mercado Pago — Equação Y preservada

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
  {
    titulo: string;
    precos: Record<"mensal" | "trimestral" | "anual", number>;
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
  // ✅ PADRÃO DEFINITIVO
  premium_dominus: {
    titulo: "Premium Dominus 360°",
    precos: { mensal: 318.49, trimestral: 796.23, anual: 3184.9 },
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plano, user_id, periodo } = await req.json();

    // ================================
    // VALIDAÇÕES FORTES
    // ================================
    if (!plano || !PLANOS[plano]) {
      return NextResponse.json(
        { error: "Plano inválido" },
        { status: 400 }
      );
    }

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json(
        { error: "Usuário inválido" },
        { status: 400 }
      );
    }

    if (!["mensal", "trimestral", "anual"].includes(periodo)) {
      return NextResponse.json(
        { error: "Período inválido" },
        { status: 400 }
      );
    }

    const planoSelecionado = PLANOS[plano];
    const preco = planoSelecionado.precos[periodo];

    // ================================
    // EQUAÇÃO Y — REFERÊNCIA EXTERNA
    // ================================
    const externalReference = `${user_id}|${plano}|${periodo}`;

    const preference = new Preference(mp);

    const result = await preference.create({
      items: [
        {
          id: plano,
          title: `${planoSelecionado.titulo} (${periodo})`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: preco,
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
    });

    if (!result.init_point) {
      throw new Error("Mercado Pago não retornou init_point");
    }

    return NextResponse.json({ init_point: result.init_point });
  } catch (err: any) {
    console.error("Erro Mercado Pago:", err);

    return NextResponse.json(
      {
        error: "Erro ao criar checkout",
        detalhe: err?.message ?? err,
      },
      { status: 500 }
    );
  }
}
