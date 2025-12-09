import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { plano_id } = await request.json();

    if (!plano_id) {
      return NextResponse.json(
        { error: "Plano inválido." },
        { status: 400 }
      );
    }

    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Token do Mercado Pago não encontrado." },
        { status: 500 }
      );
    }

    // 🔥 Cria uma preferência simples
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: `Assinatura do plano ${plano_id}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: 10,
          },
        ],
        back_urls: {
          success: "https://www.pecuariatech.com/sucesso",
          failure: "https://www.pecuariatech.com/erro",
          pending: "https://www.pecuariatech.com/pendente",
        }
      }),
    });

    const data = await mpResponse.json();

    if (!data?.init_point) {
      return NextResponse.json(
        { error: "Erro interno Mercado Pago", detalhes: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.init_point });

  } catch (error) {
    return NextResponse.json(
      { error: "Falha no servidor", detalhes: error },
      { status: 500 }
    );
  }
}
