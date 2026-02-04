import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLANOS = {
  basico: { titulo: "Plano Básico", precos: { mensal: 31.75, trimestral: 79.38, anual: 317.5 } },
  profissional: { titulo: "Plano Profissional", precos: { mensal: 52.99, trimestral: 132.48, anual: 529.9 } },
  ultra: { titulo: "Plano Ultra", precos: { mensal: 106.09, trimestral: 265.23, anual: 1060.9 } },
  empresarial: { titulo: "Plano Empresarial", precos: { mensal: 159.19, trimestral: 397.98, anual: 1591.9 } },
  premium_dominus: { titulo: "Premium Dominus 360°", precos: { mensal: 318.49, trimestral: 796.23, anual: 3184.9 } },
};

export async function POST(req: NextRequest) {
  try {
    const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!MP_TOKEN) {
      return NextResponse.json({ error: "MP token ausente" }, { status: 500 });
    }

    const { plano, periodo } = await req.json();

    if (!plano || !PLANOS[plano]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    if (!["mensal", "trimestral", "anual"].includes(periodo)) {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 });
    }

    const preco = PLANOS[plano].precos[periodo];

    const mp = new MercadoPagoConfig({ accessToken: MP_TOKEN });
    const preference = new Preference(mp);

    const result = await preference.create({
      items: [
        {
          id: plano,
          title: `${PLANOS[plano].titulo} (${periodo})`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(preco),
        },
      ],
      back_urls: {
        success: "https://www.pecuariatech.com/checkout/sucesso",
        failure: "https://www.pecuariatech.com/checkout/erro",
        pending: "https://www.pecuariatech.com/checkout/pendente",
      },
      auto_return: "approved",
    });

    if (!result?.init_point) {
      throw new Error("Sem init_point");
    }

    return NextResponse.json({ init_point: result.init_point });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar checkout", detalhe: String(e?.message) },
      { status: 500 }
    );
  }
}
