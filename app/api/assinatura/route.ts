import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();
  const { user_id, plano_id } = body;

  const { data, error } = await supabase
    .from("assinaturas")
    .insert({ user_id, plano_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ sucesso: true, assinatura: data });
}
