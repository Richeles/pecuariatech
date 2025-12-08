import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const paymentId = body?.data?.id;

    if (!paymentId) {
      return NextResponse.json({ message: "Sem ID de transação" });
    }

    // Em produção: buscar status no MercadoPago
    const status = "approved";

    if (status === "approved") {
      const { error } = await supabase
        .from("assinaturas")
        .update({ status: "ativa" })
        .order("criado_em")
        .limit(1);

      if (error) throw error;

      return NextResponse.json({ ok: true, msg: "assinatura ativada" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err }, { status: 500 });
  }
}
