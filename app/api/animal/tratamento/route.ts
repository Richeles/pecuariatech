import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { animal_id, tipo, produto, dose, observacao } = body;

  await supabase.from("animal_tratamento").insert({
    animal_id,
    data: new Date(),
    tipo,
    produto,
    dose,
    observacao,
  });

  return NextResponse.json({ ok: true });
}
