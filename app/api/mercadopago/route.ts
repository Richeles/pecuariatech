import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Recupera o token configurado no Vercel
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("Token do Mercado Pago NÃO encontrado!");
      return NextResponse.json({ error: "Token do Mercado Pago não encontrado." }, { status: 500 });
    }

    const body = await request.json();

    // 🔹 Para já funcionar — valor fixo de teste
    const amount = 10; // R$10 (pode ajustar depois)

    console.log("Criando preferência Mercado Pago...");

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: "Assinatura PecuariaTech",
            quantity: 1,
            currency_id: "BRL",
            unit_price: amount,
          },
        ],
        back_urls: {
          success: "https://www.pecuariatech.com/dashboard",
          failure: "https://www.pecuariatech.com/checkout?error=true",
          pending: "https://www.pecuariatech.com/checkout?pending=true",
        },
        auto_return: "approved",
      }),
    });

    const data = await res.json();
    console.log("Resposta Mercado Pago:", data);

    if (!data?.init_point) {
      return NextResponse.json({ error: "Falha ao gerar link" }, { status: 500 });
    }

    return NextResponse.json({ url: data.init_point });

  } catch (e) {
    console.error("Erro no servidor:", e);
    return NextResponse.json({ error: "Falha no servidor" }, { status: 500 });
  }
}
