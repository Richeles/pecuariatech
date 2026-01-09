import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase-server";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("financeiro_resumo_view")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
