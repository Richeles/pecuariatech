import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { animal_id, numero_piquete, tipo } = body;

  if (tipo === "entrada") {
    await supabase.from("animal_piquete").insert({
      animal_id,
      entrada: new Date(),
      numero_piquete,
    });
  } else {
    await supabase
      .from("animal_piquete")
      .update({ saida: new Date() })
      .eq("animal_id", animal_id)
      .is("saida", null);
  }

  return NextResponse.json({ ok: true });
}
