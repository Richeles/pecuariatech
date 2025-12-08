import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();

  if (body.type !== "payment") {
    return NextResponse.json({ status: "ignored" });
  }

  const pagamento = body.data?.id;

  const transacao = await fetch(
    `https://api.mercadopago.com/v1/payments/${pagamento}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  ).then(res => res.json());

  if (transacao.status === "approved") {
    await supabase
      .from("assinaturas")
      .update({ status: "ativa" })
      .eq("user_id", transacao.external_reference);
  }

  return NextResponse.json({ ok: true });
}
