import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(req: Request) {
  try {
    const { plano_id } = await req.json();

    if (!plano_id) {
      return NextResponse.json({ error: "plano_id obrigatório" }, { status: 400 });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
    });

    const pref = new Preference(client);

    const result = await pref.create({
      body: {
        items: [
          {
            title: "Assinatura PecuariaTech",
            quantity: 1,
            unit_price: 1, // 🔥 para teste — depois mudamos
          },
        ],
        back_urls: {
          success: "https://www.pecuariatech.com",
          failure: "https://www.pecuariatech.com",
          pending: "https://www.pecuariatech.com",
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (e: any) {
    console.error("ERRO MP:", e);
    return NextResponse.json({ error: e.message ?? "Falha MP" }, { status: 500 });
  }
}
