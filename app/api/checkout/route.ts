import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();
  const { user_id, plano_id, metodo } = body;

  const { data: plano } = await supabase
    .from("planos")
    .select("*")
    .eq("id", plano_id)
    .single();

  if (!plano) {
    return NextResponse.json(
      { error: "Plano inválido" },
      { status: 400 }
    );
  }

  const fimTrial = new Date();
  fimTrial.setDate(fimTrial.getDate() + 5);

  const { data, error } = await supabase
    .from("assinaturas")
    .insert({
      user_id,
      plano_id,
      metodo_pagamento: metodo,
      valor: plano.preco,
      fim_trial: fimTrial.toISOString(),
      renovacao_em: fimTrial.toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ status: "trial_started", assinatura: data });
}
