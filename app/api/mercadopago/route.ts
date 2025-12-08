import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();
  const { plano_id, user_id } = body;

  const mp = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });

  const { data: plano } = await supabase
    .from("planos")
    .select("*")
    .eq("id", plano_id)
    .single();

  if (!plano) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const preference = new Preference(mp);

  const checkout = await preference.create({
    body: {
      items: [
        {
          title: plano.nome,
          quantity: 1,
          currency_id: "BRL",
          unit_price: plano.preco,
        },
      ],
      external_reference: user_id,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
    },
  });

  return NextResponse.json({
    url: checkout.init_point,
  });
}
