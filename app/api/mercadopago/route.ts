import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const PUBLIC_KEY = process.env.MERCADOPAGO_CHAVE_PUBLICA;
    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!PUBLIC_KEY || !ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Credenciais Mercado Pago não configuradas." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [
            {
              title: body.plano || "Assinatura PecuariaTech",
              quantity: 1,
              currency_id: "BRL",
              unit_price: body.valor || 29.9,
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no servidor Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar pagamento." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: "Método GET não permitido." },
    { status: 405 }
  );
}
