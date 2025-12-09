import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { plano_id } = await req.json();

    if (!plano_id) {
      return NextResponse.json({ erro: "Plano não enviado" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const plano = await supabase
      .from("planos")
      .select("*")
      .eq("id", plano_id)
      .single();

    if (!plano.data) {
      return NextResponse.json({ erro: "Plano não encontrado" }, { status: 404 });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: plano.data.nome,
            quantity: 1,
            currency_id: "BRL",
            unit_price: plano.data.preco,
          },
        ],
        back_urls: {
          success: "https://www.pecuariatech.com/checkout/sucesso",
          failure: "https://www.pecuariatech.com/checkout/erro",
          pending: "https://www.pecuariatech.com/checkout/pendente",
        },
        auto_return: "approved",
        statement_descriptor: "PECUARIATECH",
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error("Erro Mercado Pago:", error);
    return NextResponse.json({ erro: "Falha ao criar pagamento" }, { status: 500 });
  }
}
