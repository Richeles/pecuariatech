import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { planId, title, price } = await req.json();

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

  if (!accessToken || !publicKey) {
    return NextResponse.json(
      { error: "Credenciais Mercado Pago não configuradas." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            unit_price: price,
          }
        ],
        back_urls: {
          success: "https://www.pecuariatech.com/sucesso",
          failure: "https://www.pecuariatech.com/erro",
        },
        auto_return: "approved"
      })
    });

    const data = await response.json();
    return NextResponse.json({ init_point: data.init_point });

  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao criar pagamento Mercado Pago." },
      { status: 500 }
    );
  }
}
