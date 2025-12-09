// app/api/mercadopago/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { planId, title, price } = await req.json();

    // Variáveis do Vercel
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_CHAVE_PUBLICA;

    if (!accessToken || !publicKey) {
      return NextResponse.json(
        { error: "Credenciais Mercado Pago não configuradas." },
        { status: 500 }
      );
    }

    // Criar preferência de pagamento
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: [
            {
              id: planId,
              title: title,
              quantity: 1,
              unit_price: price,
            },
          ],
          back_urls: {
            success: "https://www.pecuariatech.com/sucesso",
            failure: "https://www.pecuariatech.com/erro",
          },
          auto_return: "approved",
        }),
      }
    );

    const data = await response.json();

    if (!data.init_point) {
      return NextResponse.json(
        { error: "Erro ao gerar link de pagamento." },
        { status: 500 }
      );
    }

    return NextResponse.json({ init_point: data.init_point });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno ao iniciar pagamento." },
      { status: 500 }
    );
  }
}
