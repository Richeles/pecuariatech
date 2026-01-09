import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase-server";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("dre_mensal_view")
    .select("*")
    .order("mes_referencia", { ascending: false })
    .limit(12);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
