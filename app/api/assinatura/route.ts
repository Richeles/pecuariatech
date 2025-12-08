import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { usuario_id, plano_id } = body;

    if (!usuario_id || !plano_id) {
      return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("assinaturas")
      .insert({
        usuario_id,
        plano_id,
        status: "pendente",
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ sucesso: true, assinatura: data });
  } catch (e) {
    return NextResponse.json({ erro: e }, { status: 500 });
  }
}
