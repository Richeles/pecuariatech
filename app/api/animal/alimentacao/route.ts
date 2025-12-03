import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { animal_id, tipo, quantidade } = body;

  await supabase.from("animal_alimentacao").insert({
    animal_id,
    data: new Date(),
    tipo,
    quantidade,
  });

  return NextResponse.json({ ok: true });
}
