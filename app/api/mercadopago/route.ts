import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    // Variáveis do Mercado Pago (Vercel)
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const publicKey = process.env.MERCADOPAGO_CHAVE_PUBLICA;

    if (!accessToken || !publicKey) {
      return NextResponse.json(
        { error: "Credenciais Mercado Pago não configuradas." },
        { status: 500 }
      );
    }

    // Cria preferência
    const preference = {
      items: [
        {
          title: plan?.name || "Assinatura PecuariaTech",
          quantity: 1,
          unit_price: plan?.price || 10,
        },
      ],
      back_urls: {
        success: "https://www.pecuariatech.com/dashboard",
        failure: "https://www.pecuariatech.com/checkout",
      },
      auto_return: "approved",
    };

    // Envia para Mercado Pago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!data.init_point) {
      return NextResponse.json(
        { error: "Falha ao gerar checkout Mercado Pago." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.init_point });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
